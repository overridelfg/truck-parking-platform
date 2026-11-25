import { z } from "zod";
import { PARKING_STATUSES, TRUCK_TYPES } from "../../domain/validation";

export const parkingFilterSchema = z
  .object({
    kind: z.enum(["filter", "unknown"]),
    statuses: z.array(z.enum(PARKING_STATUSES)).optional(),
    truckType: z.enum(TRUCK_TYPES).optional(),
    tonight: z.boolean().optional(),
    longStay: z.boolean().optional(),
  })
  .transform((data) => {
    const hasFilter = Boolean(
      data.statuses?.length || data.truckType || data.tonight || data.longStay,
    );
    if (data.kind === "unknown" || !hasFilter) {
      return { kind: "unknown" as const };
    }
    return {
      kind: "filter" as const,
      ...(data.statuses?.length ? { statuses: data.statuses } : {}),
      ...(data.truckType ? { truckType: data.truckType } : {}),
      ...(data.tonight ? { tonight: data.tonight } : {}),
      ...(data.longStay ? { longStay: data.longStay } : {}),
    };
  });

export type ParkingFilter = z.infer<typeof parkingFilterSchema>;
