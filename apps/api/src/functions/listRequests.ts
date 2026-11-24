import { app } from "@azure/functions";
import { repository } from "../repository";
import { handle } from "./http";

app.http("listRequests", {
  methods: ["GET"],
  route: "requests",
  handler: handle(async () => {
    const items = await repository.list();
    return { status: 200, jsonBody: items };
  }),
});
