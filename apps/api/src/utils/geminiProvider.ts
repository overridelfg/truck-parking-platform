import { getAiClient } from "../utils/aiClient";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const MAX_OUTPUT_TOKENS = 300;
const LLM_TIMEOUT_MS = 5000;

export type GenerateJsonOptions = {
  systemInstruction?: string;
  schema?: unknown;
  maxLength?: number;
};

export async function generateJsonResponse(
  text: string,
  options: GenerateJsonOptions = {},
): Promise<string> {
  const aiClient = getAiClient();
  if (!aiClient) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { systemInstruction, schema, maxLength } = options;

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("LLM timeout")), LLM_TIMEOUT_MS);
  });

  const prompt = maxLength !== undefined ? text.slice(0, maxLength) : text;

  try {
    const res = await Promise.race([
      aiClient.models.generateContent({
        model: process.env.ASSISTANT_MODEL ?? DEFAULT_MODEL,
        contents: prompt,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          responseMimeType: "application/json",
          ...(schema ? { responseSchema: schema } : {}),
          temperature: 0,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      }),
      timeout,
    ]);

    return res.text ?? "";
  } finally {
    clearTimeout(timer);
  }
}
