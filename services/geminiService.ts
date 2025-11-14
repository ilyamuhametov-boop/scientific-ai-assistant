import { GraphData, ComparisonArticle } from "../types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
    throw new Error("Переменная окружения OPENROUTER_API_KEY не установлена");
}

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || "Scientific AI Assistant";
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS || "4096");

const FAST_MODEL = process.env.OPENROUTER_FAST_MODEL || "google/gemini-2.5-flash";
const THINK_MODEL = process.env.OPENROUTER_THINK_MODEL || "anthropic/claude-3.5-sonnet-20240620";
const JSON_MODEL = process.env.OPENROUTER_JSON_MODEL || "google/gemini-2.5-flash-lite-preview-09-2025";

type Message = {
    role: "system" | "user" | "assistant";
    content: string;
};

async function callOpenRouter(
    model: string,
    messages: Message[],
    extraBody: Record<string, unknown> = {}
) {
    const payload = {
        model,
        messages,
        max_tokens: OPENROUTER_MAX_TOKENS,
        ...extraBody,
    };

    const response = await fetch(OPENROUTER_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": OPENROUTER_SITE_URL,
            "X-Title": OPENROUTER_APP_NAME,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
        const message = data?.error?.message || response.statusText || "Неизвестная ошибка OpenRouter";
        throw new Error(message);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Пустой ответ модели");
    }

    if (typeof content === "string") {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((chunk: any) => (typeof chunk === "string" ? chunk : chunk?.text ?? ""))
            .join("")
            .trim();
    }

    return (content as { text?: string }).text ?? "";
}

export async function generateResponse(
    prompt: string,
    context: string | null,
    isThinkingMode: boolean,
    useGrounding: boolean = false
): Promise<string> {
    const scholarlySystemInstruction =
        "Ты — полезный ИИ-ассистент для студентов и исследователей. Твоя задача — анализировать предоставленный текст из научного документа и отвечать на вопросы точно и кратко.";
    const writingSystemInstruction =
        "Ты — полезный ИИ-ассистент для письма. Помогай улучшать тексты, проверяй стиль и перефразируй, основываясь только на предоставленном тексте.";

    let userPrompt: string;
    if (context) {
        userPrompt = `Based on the following scientific article context, please answer the user's request. Provide your answer in well-structured markdown format.

--- CONTEXT START ---
${context.substring(0, 30000)}
--- CONTEXT END ---

User Request: ${prompt}`;
    } else {
        userPrompt = prompt;
    }

    if (useGrounding) {
        userPrompt = `You cannot access the web in this environment. Use only the provided context.\n\n${userPrompt}`;
    }

    const systemInstruction = context ? scholarlySystemInstruction : writingSystemInstruction;
    const model = isThinkingMode ? THINK_MODEL : FAST_MODEL;

    try {
        const answer = await callOpenRouter(model, [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
        ]);
        return answer;
    } catch (error) {
        console.error("Error generating response via OpenRouter:", error);
        if (error instanceof Error) {
            return `Не удалось получить ответ от ИИ: ${error.message}`;
        }
        return "Произошла неизвестная ошибка при взаимодействии с ИИ.";
    }
}

export async function generateGraphData(context: string): Promise<GraphData> {
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
        const raw = await callOpenRouter(
            JSON_MODEL,
            [
                { role: "system", content: "Ты ассистент, который возвращает строго валидный JSON с графом знаний." },
                { role: "user", content: prompt },
            ],
            { response_format: { type: "json_object" } }
        );

        const graphData = JSON.parse(raw);
        if (!graphData.nodes || !graphData.edges) {
            throw new Error("Получен некорректный формат JSON для графа.");
        }

        return graphData as GraphData;
    } catch (error) {
        console.error("Ошибка при генерации данных графа:", error);
        if (error instanceof Error) {
            throw new Error(`Не удалось сгенерировать граф знаний: ${error.message}`);
        }
        throw new Error("Произошла неизвестная ошибка при создании графа.");
    }
}

export async function generateComparison(articles: ComparisonArticle[]): Promise<string> {
    const articlesContext = articles
        .map((article, index) => {
            return `
--- СТАТЬЯ ${index + 1}: ${article.fileName} ---
${article.pdfText.substring(0, 15000)}
--- КОНЕЦ СТАТЬИ ${index + 1} ---
`;
        })
        .join("\n\n");

    const articleTitles = articles.map((a, i) => `"Статья ${i + 1} (${a.fileName})"`).join(", ");

    const prompt = `Ты — эксперт по анализу научных работ. Проведи детальное сравнение статей.
В ответе в формате markdown укажи:
1. **Общие темы и выводы** для всех статей.
2. **Различия в методологии** в виде таблицы с колонками "Параметр сравнения", ${articleTitles}.
3. **Противоречия и разные выводы**.
4. **Итоговое резюме** о том, как статьи соотносятся.

${articlesContext}
`;

    try {
        const answer = await callOpenRouter(THINK_MODEL, [
            { role: "system", content: "Ты аналитик научных текстов. Всегда отвечай в формате Markdown." },
            { role: "user", content: prompt },
        ]);
        return answer;
    } catch (error) {
        console.error("Error generating comparison via OpenRouter:", error);
        if (error instanceof Error) {
            return `Не удалось сгенерировать сравнение: ${error.message}`;
        }
        return "Произошла неизвестная ошибка при сравнении статей.";
    }
}
