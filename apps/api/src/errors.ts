import type { HttpResponseInit } from "@azure/functions";

export const HttpStatus = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  FINAL_STATE_LOCKED: "FINAL_STATE_LOCKED",
  MISSING_PARKING_SPOT: "MISSING_PARKING_SPOT",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export class HttpError extends Error {
  constructor(
    public readonly status: HttpStatusCode,
    public readonly code: ErrorCodeType,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_ERROR,
    message,
    details,
  );

export const notFound = (message: string) =>
  new HttpError(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, message);

export const conflict = (code: ErrorCodeType, message: string) =>
  new HttpError(HttpStatus.CONFLICT, code, message);

export function toResponse(err: unknown): HttpResponseInit {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      jsonBody: {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
    };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    jsonBody: {
      error: {
        code: ErrorCode.INTERNAL,
        message: "Unexpected error",
      },
    },
  };
}
