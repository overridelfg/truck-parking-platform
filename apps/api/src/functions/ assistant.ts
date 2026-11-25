import { app } from "@azure/functions";
import type { AssistantResponse } from "@truck-parking-platform/shared";
import { applyIntent } from "../assistant/query";
import { resolveIntent } from "../assistant/resolveIntent";
import { badRequest } from "../errors";
import { repository } from "../repository";
import { handle, readJson } from "./http";

app.http("assistantQuery", {
  methods: ["POST"],
  route: "assistant/query",
  handler: handle(async (request) => {
    const body = (await readJson(request)) as { query?: unknown };
    if (typeof body?.query !== "string" || !body.query.trim()) {
      throw badRequest("query must be a non-empty string");
    }
    const { intent, source } = await resolveIntent(body.query);
    const result = applyIntent(intent, await repository.list());
    const response: AssistantResponse = { ...result, source };
    return { status: 200, jsonBody: response };
  }),
});
