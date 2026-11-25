import { useMutation } from "@tanstack/react-query";
import { assistantApi } from "../api/assistant";

export function useAssistantQuery() {
  return useMutation({
    mutationFn: (query: string) => assistantApi.query({ query }),
  });
}
