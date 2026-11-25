import type { z } from "zod";
import { generateJsonResponse } from "./geminiProvider";

export async function parseWithLlm<T>(
  text: string,
  options: {
    schema: z.ZodType<T>;
    responseSchema?: unknown;
    systemInstruction?: string;
    maxLength?: number;
  },
): Promise<T | null> {
  const rawText = await generateJsonResponse(text, {
    systemInstruction: options.systemInstruction,
    schema: options.responseSchema,
    maxLength: options.maxLength,
  });

  let raw: unknown;
  try {
    raw = JSON.parse(rawText);
  } catch {
    return null;
  }

  const parsed = options.schema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
