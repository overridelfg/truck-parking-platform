import { app } from "@azure/functions";
import type { AssistantResponse } from "@truck-parking-platform/shared";

import {
  applyParkingRequestFilter,
  parseParkingQuery,
} from "../assistant/parking";
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

    const { filter, source } = await parseParkingQuery(body.query);
    const requests = await repository.list();
    const result = applyParkingRequestFilter(filter, requests);
    const response: AssistantResponse = { ...result, source };

    return { status: 200, jsonBody: response };
  }),
});
