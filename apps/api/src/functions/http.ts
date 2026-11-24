import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { badRequest, toResponse } from "../errors";

export async function readJson(request: HttpRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON");
  }
}

export function handle(
  fn: (
    request: HttpRequest,
    context: InvocationContext,
  ) => Promise<HttpResponseInit>,
) {
  return async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    try {
      return await fn(request, context);
    } catch (err) {
      if (!(err instanceof Error && "status" in err)) {
        context.error(err);
      }
      return toResponse(err);
    }
  };
}
