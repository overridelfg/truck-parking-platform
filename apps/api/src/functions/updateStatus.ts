import { app } from "@azure/functions";
import { notFound } from "../errors";
import { assertValidTransition, parseStatusInput } from "../domain/validation";
import { repository } from "../repository";
import { handle, readJson } from "./http";

app.http("updateStatus", {
  methods: ["PATCH"],
  route: "requests/{id}/status",
  handler: handle(async (request) => {
    const id = request.params.id;
    const input = parseStatusInput(await readJson(request));

    const current = await repository.get(id);
    if (!current) throw notFound(`Parking request '${id}' not found`);

    assertValidTransition(current, input);

    const updated = await repository.update(id, {
      status: input.status,
      ...(input.parkingSpotId ? { parkingSpotId: input.parkingSpotId } : {}),
    });
    return { status: 200, jsonBody: updated };
  }),
});
