import { app } from "@azure/functions";
import { notFound } from "../errors";
import { repository } from "../repository";
import { handle } from "./http";

app.http("getRequest", {
  methods: ["GET"],
  route: "requests/{id}",
  handler: handle(async (request) => {
    const item = await repository.get(request.params.id);
    if (!item)
      throw notFound(`Parking request '${request.params.id}' not found`);
    return { status: 200, jsonBody: item };
  }),
});
