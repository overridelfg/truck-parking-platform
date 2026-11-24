import { app } from "@azure/functions";
import { notFound } from "../errors";
import { repository } from "../repository";
import { handle } from "./http";

app.http("deleteRequest", {
  methods: ["DELETE"],
  route: "requests/{id}",
  handler: handle(async (request) => {
    const deleted = await repository.delete(request.params.id);
    if (!deleted)
      throw notFound(`Parking request '${request.params.id}' not found`);
    return { status: 204 };
  }),
});
