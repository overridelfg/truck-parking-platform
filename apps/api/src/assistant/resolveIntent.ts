import type { AssistantSource } from "@truck-parking-platform/shared";
import { parseQuery, type Intent } from "./intent";
import { parseQueryWithLlm } from "./llmParser";

export async function resolveIntent(
  text: string,
  llm: (t: string) => Promise<Intent> = parseQueryWithLlm,
  hasKey = !!process.env.GEMINI_API_KEY,
): Promise<{ intent: Intent; source: AssistantSource }> {
  if (!hasKey) return { intent: parseQuery(text), source: "rules" };

  try {
    const intent = await llm(text);
    if (intent.kind === "unknown") {
      const fallback = parseQuery(text);
      if (fallback.kind === "filter")
        return { intent: fallback, source: "rules" };
    }
    return { intent, source: "llm" };
  } catch (e) {
    console.error("resolveIntent: LLM failed:", e);
    return { intent: parseQuery(text), source: "rules" };
  }
}
