import type { AssistantSource } from "@truck-parking-platform/shared";
import { getAiClient } from "../../utils/aiClient";
import { parseParkingFilterWithLlm } from "./parseParkingFilterWithLlm";
import { parseParkingFilterWithRules } from "./parseParkingFilterWithRules";
import type { ParkingFilter } from "./schema";

export async function parseParkingQuery(
  text: string,
  llmParser: (t: string) => Promise<ParkingFilter> = parseParkingFilterWithLlm,
  hasKey = Boolean(getAiClient()),
): Promise<{ filter: ParkingFilter; source: AssistantSource }> {
  if (!hasKey) {
    return { filter: parseParkingFilterWithRules(text), source: "rules" };
  }

  try {
    const filter = await llmParser(text);
    if (filter.kind === "unknown") {
      const fallback = parseParkingFilterWithRules(text);
      if (fallback.kind === "filter") {
        return { filter: fallback, source: "rules" };
      }
    }
    return { filter, source: "llm" };
  } catch (e) {
    console.error("parseParkingQuery: LLM failed:", e);
    return { filter: parseParkingFilterWithRules(text), source: "rules" };
  }
}
