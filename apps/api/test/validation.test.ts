import { describe, expect, it } from "vitest";
import type { ParkingRequest } from "@truck-parking-platform/shared";
import {
  assertValidTransition,
  parseCreateInput,
  parseStatusInput,
} from "../src/domain/validation";
import { HttpError } from "../src/errors";

const validBody = {
  driverName: "Kirill",
  licensePlate: "B-AB 123",
  truckType: "semi",
  requestedFrom: "2026-11-25T10:00:00Z",
  requestedUntil: "2026-11-25T18:00:00Z",
};

function expectHttpError(fn: () => unknown, status: number, code?: string) {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(status);
    if (code) expect((err as HttpError).code).toBe(code);
    return;
  }
  throw new Error("Expected function to throw");
}

const request = (status: ParkingRequest["status"]): ParkingRequest => ({
  id: "parking_test",
  ...(validBody as Omit<ParkingRequest, "id" | "status">),
  status,
});

describe("parseCreateInput", () => {
  it("accepts a valid body", () => {
    expect(parseCreateInput(validBody).driverName).toBe("Kirill");
  });

  it("rejects requestedUntil earlier than requestedFrom", () => {
    expectHttpError(
      () =>
        parseCreateInput({
          ...validBody,
          requestedFrom: "2026-11-25T18:00:00Z",
          requestedUntil: "2026-11-25T10:00:00Z",
        }),
      400,
    );
  });

  it("rejects requestedUntil equal to requestedFrom", () => {
    expectHttpError(
      () =>
        parseCreateInput({
          ...validBody,
          requestedUntil: validBody.requestedFrom,
        }),
      400,
    );
  });

  it("rejects missing required fields", () => {
    expectHttpError(() => parseCreateInput({ driverName: "Kirill" }), 400);
  });

  it("rejects unknown truck type", () => {
    expectHttpError(
      () => parseCreateInput({ ...validBody, truckType: "rocket" }),
      400,
    );
  });

  it("rejects invalid dates", () => {
    expectHttpError(
      () => parseCreateInput({ ...validBody, requestedFrom: "yesterday-ish" }),
      400,
    );
  });
});

describe("parseStatusInput", () => {
  it("rejects unknown status", () => {
    expectHttpError(() => parseStatusInput({ status: "flying" }), 400);
  });
});

describe("assertValidTransition", () => {
  it("allows approve with parkingSpotId", () => {
    expect(() =>
      assertValidTransition(request("pending"), {
        status: "approved",
        parkingSpotId: "A-12",
      }),
    ).not.toThrow();
  });

  it("rejects approve without parkingSpotId with 400", () => {
    expectHttpError(
      () => assertValidTransition(request("pending"), { status: "approved" }),
      400,
    );
  });

  it("rejects skipping a step with 409", () => {
    expectHttpError(
      () => assertValidTransition(request("pending"), { status: "checked_in" }),
      409,
      "INVALID_TRANSITION",
    );
  });

  it("rejects any change from a final status with 409", () => {
    expectHttpError(
      () =>
        assertValidTransition(request("checked_out"), { status: "pending" }),
      409,
    );
    expectHttpError(
      () =>
        assertValidTransition(request("rejected"), {
          status: "approved",
          parkingSpotId: "A-1",
        }),
      409,
    );
  });
});
