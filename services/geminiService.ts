import { GoogleGenAI, Type } from "@google/genai";
import { GraphData, ComparisonArticle } from "../types";

if (!process.env.API_KEY) {
    throw new Error("Переменная окружения API_KEY не установлена");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateResponse(
    prompt: string, 
    context: string | null, 
    isThinkingMode: boolean,
    useGrounding: boolean = false
): Promise<string> {
    
    const modelName = isThinkingMode && !useGrounding ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const scholarlySystemInstruction = "Ты — полезный ИИ-ассистент для студентов и исследователей. Твоя задача — анализировать предоставленный текст из научного документа и отвечать на вопросы точно и кратко. При поиске в интернете, ссылайся на авторитетные научные источники.";
    const writingSystemInstruction = "Ты — полезный ИИ-ассистент для письма. Твоя задача — помогать пользователям улучшать их тексты, проверять стиль и перефразировать, основываясь только на предоставленном тексте.";

    const config: any = {};
    let fullPrompt = '';

    if (context) {
        fullPrompt = `Based on the following scientific article context, please answer the user's request. Provide your answer in well-structured markdown format.

--- CONTEXT START ---
${context.substring(0, 30000)}
--- CONTEXT END ---

User Request: ${prompt}`;
    } else {
        fullPrompt = prompt;
    }


    if (isThinkingMode && !useGrounding) {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    if (useGrounding) {
        config.tools = [{googleSearch: {}}];
        // Move system instruction to prompt when using tools to avoid conflicts
        fullPrompt = `${scholarlySystemInstruction}\n\n${fullPrompt}`;
    } else {
        // Use the appropriate system instruction based on whether context is provided
        config.systemInstruction = context ? scholarlySystemInstruction : writingSystemInstruction;
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config,
        });

        let responseText = response.text;

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        if (useGrounding && groundingMetadata?.groundingChunks) {
            const sources = groundingMetadata.groundingChunks
                .map(chunk => chunk.web)
                .filter((web): web is { uri: string; title: string } => !!(web && web.uri && web.title));

            const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

            if (uniqueSources.length > 0) {
                const sourcesMarkdown = uniqueSources
                    .map((source: { title: string; uri: string }, index) => `${index + 1}. [${source.title}](${source.uri})`)
                    .join('\n');
                responseText += `\n\n**Источники:**\n${sourcesMarkdown}`;
            }
        }
        
        return responseText;

    } catch (error) {
        console.error("Error generating response from Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes("candidate must have finish reason FINISH_REASON_OTHER")) {
                 return "Извините, ответ не может быть сгенерирован, так как запрос был заблокирован из-за настроек безопасности. Пожалуйста, попробуйте переформулировать ваш запрос.";
            }
             if (error.message.includes("400 Bad Request")) {
                return "Произошла ошибка в запросе. Возможно, `systemInstruction` и `tools` не могут использоваться вместе для этой модели. Пожалуйста, попробуйте отключить 'Расширенный режим' при использовании поиска.";
            }
            return `Не удалось получить ответ от ИИ: ${error.message}`;
        }
        return "Произошла неизвестная ошибка при взаимодействии с ИИ.";
    }
}


export async function generateGraphData(context: string): Promise<GraphData> {
    const modelName = 'gemini-2.5-flash';
    
    const prompt = `Проанализируй следующий текст научной статьи и создай граф знаний.
Извлеки ключевые сущности (концепции, теории, исследователи, методы) и определи отношения между ними.
Верни результат в виде JSON-объекта со следующей структурой: { "nodes": [{"id": number, "label": "string"}], "edges": [{"from": number, "to": number, "label": "string"}] }.
- 'nodes' должен быть массивом объектов, представляющих сущности. Каждая нода должна иметь уникальный 'id' и 'label'.
- 'edges' должен быть массивом объектов, представляющих связи. Каждая связь должна иметь 'from' и 'to', соответствующие 'id' нод, и 'label' для описания типа связи.
- Не создавай более 25 нод для ясности.
- JSON должен быть полным и корректным.

--- КОНТЕКСТ СТАТЬИ ---
${context.substring(0, 25000)}
--- КОНЕЦ КОНТЕКСТА ---
`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonText = response.text.trim();
        const graphData = JSON.parse(jsonText);

        if (!graphData.nodes || !graphData.edges) {
            throw new Error("Получен некорректный формат JSON для графа.");
        }

        return graphData as GraphData;

    } catch (error) {
        console.error("Ошибка при генерации данных графа:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Не удалось разобрать JSON-ответ от ИИ. Он мог вернуть невалидный формат.");
        }
        if (error instanceof Error) {
            throw new Error(`Не удалось сгенерировать граф знаний: ${error.message}`);
        }
        throw new Error("Произошла неизвестная ошибка при создании графа.");
    }
}

export async function generateComparison(articles: ComparisonArticle[]): Promise<string> {
    const modelName = 'gemini-2.5-pro';

    let articlesContext = articles.map((article, index) => {
        return `
--- СТАТЬЯ ${index + 1}: ${article.fileName} ---
${article.pdfText.substring(0, 15000)}
--- КОНЕЦ СТАТЬИ ${index + 1} ---
`;
    }).join('\n\n');

    const articleTitles = articles.map((a, i) => `"Статья ${i+1} (${a.fileName})"`).join(', ');

    const prompt = `Ты — эксперт по анализу научных работ. Тебе предоставлены тексты из нескольких научных статей. Твоя задача — провести их детальное сравнение.
Проанализируй предоставленные контексты и подготовь структурированный отчет в формате markdown.

Отчет должен включать следующие разделы:
1.  **Общие темы и выводы**: Определи и опиши ключевые идеи, гипотезы или результаты, которые являются общими для всех или нескольких статей.
2.  **Различия в методологии**: Представь детальное сравнение методологий в виде **markdown-таблицы**. Таблица должна иметь столбцы "Параметр сравнения", ${articleTitles}. Включи в параметры сравнения такие аспекты, как объект исследования, место проведения, основные инструменты, экспериментальный дизайн и методы анализа данных.
3.  **Противоречия и разные выводы**: Выдели любые противоречащие друг другу выводы, результаты или интерпретации данных между статьями.
4.  **Итоговое резюме**: Сделай общий вывод о том, как эти статьи соотносятся друг с другом. Дополняют ли они друг друга, спорят или рассматривают одну и ту же проблему с разных сторон?

Твой ответ должен быть объективным, подробным и основанным исключительно на предоставленных текстах.

${articlesContext}
`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating comparison from Gemini:", error);
        if (error instanceof Error) {
            return `Не удалось сгенерировать сравнение: ${error.message}`;
        }
        return "Произошла неизвестная ошибка при сравнении статей.";
    }
}