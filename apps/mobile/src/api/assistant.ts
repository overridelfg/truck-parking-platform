import type {
  AssistantQueryInput,
  AssistantResponse,
} from "@truck-parking-platform/shared";
import { request } from "./client";

const BASE = "/assistant";

export const assistantApi = {
  query: (input: AssistantQueryInput) =>
    request<AssistantResponse>(
      `${BASE}/query`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      20000,
    ),
};
