import { z } from "zod";
import type {
  CreateParkingRequestInput,
  ParkingRequest,
  ParkingStatus,
  TruckType,
  UpdateStatusInput,
} from "@truck-parking-platform/shared";
import { badRequest, conflict } from "../errors";
import { canTransition } from "./statusTransitions";

const TRUCK_TYPES = [
  "solo",
  "semi",
  "tanker",
] as const satisfies readonly TruckType[];
const PARKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "checked_in",
  "checked_out",
] as const satisfies readonly ParkingStatus[];

const isoDate = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), "must be a valid ISO 8601 date");

const createSchema = z
  .object({
    driverName: z.string().trim().min(1),
    licensePlate: z.string().trim().min(1),
    truckType: z.enum(TRUCK_TYPES),
    requestedFrom: isoDate,
    requestedUntil: isoDate,
    note: z.string().optional(),
  })
  .refine((v) => Date.parse(v.requestedUntil) > Date.parse(v.requestedFrom), {
    message: "requestedUntil must be later than requestedFrom",
    path: ["requestedUntil"],
  });

const statusSchema = z.object({
  status: z.enum(PARKING_STATUSES),
  parkingSpotId: z.string().trim().min(1).optional(),
});

export function parseCreateInput(body: unknown): CreateParkingRequestInput {
  const result = createSchema.safeParse(body);
  if (!result.success) {
    throw badRequest("Invalid request body", z.flattenError(result.error));
  }
  return result.data;
}

export function parseStatusInput(body: unknown): UpdateStatusInput {
  const result = statusSchema.safeParse(body);
  if (!result.success) {
    throw badRequest("Invalid status payload", z.flattenError(result.error));
  }
  return result.data;
}

export function assertValidTransition(
  current: ParkingRequest,
  input: UpdateStatusInput,
): void {
  if (!canTransition(current.status, input.status)) {
    throw conflict(
      "INVALID_TRANSITION",
      `Cannot change status from '${current.status}' to '${input.status}'`,
    );
  }
  if (input.status === "approved" && !input.parkingSpotId) {
    throw badRequest("parkingSpotId is required when approving a request");
  }
}
