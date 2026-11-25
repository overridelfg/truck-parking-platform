import { app } from "@azure/functions";
import type { AssistantResponse } from "@truck-parking-platform/shared";

import { badRequest } from "../errors";
import { repository } from "../repository";
import { handle, readJson } from "./http";
import { parseParkingQuery } from "../assistant/parking/parseParkingQuery";
import { applyParkingFilter } from "../assistant/parking/query";

app.http("assistantQuery", {
  methods: ["POST"],
  route: "assistant/query",
  handler: handle(async (request) => {
    const body = (await readJson(request)) as { query?: unknown };
    if (typeof body?.query !== "string" || !body.query.trim()) {
      throw badRequest("query must be a non-empty string");
    }
    const { intent, source } = await parseParkingQuery(body.query);
    const result = applyParkingFilter(intent, await repository.list());
    const response: AssistantResponse = { ...result, source };
    return { status: 200, jsonBody: response };
  }),
});
