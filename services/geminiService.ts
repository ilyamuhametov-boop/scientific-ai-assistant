import { GraphData, ComparisonArticle } from "../types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
    throw new Error("Требуется задать переменную OPENROUTER_API_KEY");
}

const OPENROUTER_BASE_URL = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
const OPENROUTER_COMPLETIONS_URL = `${OPENROUTER_BASE_URL}/chat/completions`;
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || "Научный ИИ-ассистент";
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS || "4096");

const FAST_MODEL = process.env.OPENROUTER_FAST_MODEL || "google/gemini-2.5-flash";
const THINK_MODEL = process.env.OPENROUTER_THINK_MODEL || "anthropic/claude-3.5-sonnet-20240620";
const JSON_MODEL = process.env.OPENROUTER_JSON_MODEL || "google/gemini-2.5-flash-lite-preview-09-2025";
const QWEN_FREE_MODEL = "qwen/qwen3-235b-a22b:free";
const DEEPSEEK_TERMINUS_MODEL = "deepseek/deepseek-v3.1-terminus";

export interface ChatModelOption {
    id: string;
    label: string;
}

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
    { id: FAST_MODEL, label: `Gemini Flash (${FAST_MODEL})` },
    { id: THINK_MODEL, label: `Claude 3.5 (${THINK_MODEL})` },
    { id: QWEN_FREE_MODEL, label: "Qwen 3.5 235B (free)" },
    { id: DEEPSEEK_TERMINUS_MODEL, label: "DeepSeek V3.1 Terminus" },
];

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

    const response = await fetch(OPENROUTER_COMPLETIONS_URL, {
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
        throw new Error("Пустой ответ от модели");
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
    useGrounding: boolean = false,
    explicitModel?: string
): Promise<string> {
    const scholarlySystemInstruction =
        "Ты — научный ИИ-ассистент, который помогает с анализом статей и ответами на вопросы по ним. Пиши ясно и структурированно.";
    const writingSystemInstruction =
        "Ты — научный ИИ-ассистент для творческих задач. Пиши развернуто, но без воды, используя строгий стиль.";

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
    const model = explicitModel || (isThinkingMode ? THINK_MODEL : FAST_MODEL);

    try {
        const answer = await callOpenRouter(model, [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
        ]);
        return answer;
    } catch (error) {
        console.error("Error generating response via OpenRouter:", error);
        if (error instanceof Error) {
            return `Не удалось получить ответ от модели: ${error.message}`;
        }
        return "Произошла неизвестная ошибка при обращении к модели.";
    }
}

export async function generateGraphData(context: string): Promise<GraphData> {
    const prompt = `Проанализируй следующую статью и подготовь краткий граф связей.
Составь JSON-структуру формата: { "nodes": [{"id": number, "label": string}], "edges": [{"from": number, "to": number, "label": string}] }.
- nodes: ключевые понятия или элементы исследования (максимум 25 штук).
- edges: связи между понятиями с короткими текстовыми подписями.
- JSON должен быть валидным и без лишнего текста.

--- CONTEXT START ---
${context.substring(0, 25000)}
--- CONTEXT END ---`;

    try {
        const raw = await callOpenRouter(
            JSON_MODEL,
            [
                { role: "system", content: "Ты строго отвечаешь валидным JSON и ничего больше." },
                { role: "user", content: prompt },
            ],
            { response_format: { type: "json_object" } }
        );

        const graphData = JSON.parse(raw);
        if (!graphData.nodes || !graphData.edges) {
            throw new Error("Не удалось разобрать структуру JSON");
        }

        return graphData as GraphData;
    } catch (error) {
        console.error("Ошибка при генерации графа:", error);
        if (error instanceof Error) {
            throw new Error(`Не удалось построить граф: ${error.message}`);
        }
        throw new Error("Произошла неизвестная ошибка при генерации графа.");
    }
}

export async function generateComparison(articles: ComparisonArticle[]): Promise<string> {
    const articlesContext = articles
        .map((article, index) => {
            return `
--- Статья ${index + 1}: ${article.fileName} ---
${article.pdfText.substring(0, 15000)}
--- Конец статьи ${index + 1} ---
`;
        })
        .join("\n\n");

    const articleTitles = articles.map((a, i) => `Статья ${i + 1} (${a.fileName})`).join(", ");

    const prompt = `Ты — аналитик научных публикаций. Сравни предоставленные статьи и оформи ответ в Markdown по следующему плану:
1. **Основные темы и выводы** каждой статьи.
2. **Отличия и сходства** (таблица, где строки — критерии сравнения, столбцы — ${articleTitles}).
3. **Сильные стороны и ограничения**.
4. **Практические рекомендации**.

${articlesContext}`;

    try {
        const answer = await callOpenRouter(THINK_MODEL, [
            { role: "system", content: "Ты сравниваешь научные статьи и отвечаешь в Markdown." },
            { role: "user", content: prompt },
        ]);
        return answer;
    } catch (error) {
        console.error("Error generating comparison via OpenRouter:", error);
        if (error instanceof Error) {
            return `Не удалось выполнить сравнение: ${error.message}`;
        }
        return "Произошла неизвестная ошибка при сравнении статей.";
    }
}


