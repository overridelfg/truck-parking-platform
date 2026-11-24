import type { HttpResponseInit } from "@azure/functions";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (msg: string, details?: unknown) =>
  new HttpError(400, "VALIDATION_ERROR", msg, details);
export const notFound = (msg: string) => new HttpError(404, "NOT_FOUND", msg);
export const conflict = (code: string, msg: string) =>
  new HttpError(409, code, msg);

export function toResponse(err: unknown): HttpResponseInit {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      jsonBody: {
        error: { code: err.code, message: err.message, details: err.details },
      },
    };
  }
  return {
    status: 500,
    jsonBody: { error: { code: "INTERNAL", message: "Unexpected error" } },
  };
}
