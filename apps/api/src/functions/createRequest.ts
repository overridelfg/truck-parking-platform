import { app } from "@azure/functions";
import { randomUUID } from "node:crypto";
import type { ParkingRequest } from "@truck-parking-platform/shared";
import { parseCreateInput } from "../domain/validation";
import { repository } from "../repository";
import { handle, readJson } from "./http";

app.http("createRequest", {
  methods: ["POST"],
  route: "requests",
  handler: handle(async (request) => {
    const input = parseCreateInput(await readJson(request));
    const item: ParkingRequest = {
      id: `parking_${randomUUID()}`,
      ...input,
      status: "pending",
    };
    const created = await repository.create(item);
    return { status: 201, jsonBody: created };
  }),
});
