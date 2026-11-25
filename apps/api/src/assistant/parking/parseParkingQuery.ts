import type { AssistantSource } from "@truck-parking-platform/shared";
import { getAiClient } from "../../utils/aiClient";
import { parseParkingFilterWithLlm } from "./parseParkingFilterWithLlm";
import { ParkingFilter } from "./schema";
import { parseParkingFilterWithRules } from "./parseParkingFilterWithRules";

export async function parseParkingQuery(
  text: string,
  llmParser: (t: string) => Promise<ParkingFilter> = parseParkingFilterWithLlm,
  hasKey = Boolean(getAiClient()),
): Promise<{ intent: ParkingFilter; source: AssistantSource }> {
  if (!hasKey)
    return { intent: parseParkingFilterWithRules(text), source: "rules" };

  try {
    const intent = await llmParser(text);
    if (intent.kind === "unknown") {
      const fallback = parseParkingFilterWithRules(text);
      if (fallback.kind === "filter") {
        return { intent: fallback, source: "rules" };
      }
    }
    return { intent, source: "llm" };
  } catch (e) {
    console.error("parseParkingQuery: LLM failed:", e);
    return { intent: parseParkingFilterWithRules(text), source: "rules" };
  }
}
