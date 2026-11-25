import type { ParkingStatus, TruckType } from "@truck-parking-platform/shared";
import type { ParkingFilter } from "./schema";

const STATUS_PATTERNS: [RegExp, ParkingStatus][] = [
  [/pending|waiting|ausstehend/i, "pending"],
  [/approved|genehmigt/i, "approved"],
  [/rejected|declined|abgelehnt/i, "rejected"],
  [/checked[ _-]?in|arrived/i, "checked_in"],
  [/checked[ _-]?out|departed/i, "checked_out"],
];

const TRUCK_TYPE_PATTERNS: [RegExp, TruckType][] = [
  [/tanker/i, "tanker"],
  [/semi/i, "semi"],
  [/solo/i, "solo"],
];

// Word boundaries: "language" and "along" must not count as "long".
const LONG_STAY_PATTERN = /\blong(er|est)?\b|unusual/i;
const TONIGHT_PATTERN = /tonight|heute nacht/i;

export function parseParkingFilterWithRules(text: string): ParkingFilter {
  const statuses = STATUS_PATTERNS.filter(([re]) => re.test(text)).map(
    ([, status]) => status,
  );
  const truckType = TRUCK_TYPE_PATTERNS.find(([re]) => re.test(text))?.[1];
  const tonight = TONIGHT_PATTERN.test(text);
  const longStay = LONG_STAY_PATTERN.test(text);

  if (!statuses.length && !truckType && !tonight && !longStay) {
    return { kind: "unknown" };
  }

  return {
    kind: "filter",
    ...(statuses.length ? { statuses } : {}),
    ...(truckType ? { truckType } : {}),
    ...(tonight ? { tonight } : {}),
    ...(longStay ? { longStay } : {}),
  };
}
