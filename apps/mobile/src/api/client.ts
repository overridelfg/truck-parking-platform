import type { ApiError as ApiErrorBody } from "@truck-parking-platform/shared";
import { API_URL } from "../config";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<T> {
  let res: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: init.body
        ? { "Content-Type": "application/json", ...init.headers }
        : init.headers,
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.error(`API request failed (${API_URL}${path}):`, err);
    throw new ApiError(
      0,
      isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      isTimeout
        ? "Request timed out. Please try again."
        : "Cannot reach the server. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => undefined);
  if (!res.ok) {
    const e = (body as ApiErrorBody | undefined)?.error;
    throw new ApiError(
      res.status,
      e?.code ?? "UNKNOWN",
      e?.message ?? `Request failed (${res.status})`,
      e?.details,
    );
  }
  return body as T;
}
