import type { ParkingStatus, TruckType } from "@truck-parking-platform/shared";
import { ParkingFilter } from "./schema";

const STATUS_PATTERNS: [RegExp, ParkingStatus][] = [
  [/pending|waiting|ausstehend/i, "pending"],
  [/approved|genehmigt/i, "approved"],
  [/rejected|declined|abgelehnt/i, "rejected"],
  [/checked[ _-]?in|arrived/i, "checked_in"],
  [/checked[ _-]?out|departed|left/i, "checked_out"],
];

const TRUCK_TYPE_PATTERNS: [RegExp, TruckType][] = [
  [/tanker/i, "tanker"],
  [/semi/i, "semi"],
  [/solo/i, "solo"],
];

export function parseParkingFilterWithRules(text: string): ParkingFilter {
  const statuses = STATUS_PATTERNS.filter(([re]) => re.test(text)).map(
    ([, status]) => status,
  );
  const truckType = TRUCK_TYPE_PATTERNS.find(([re]) => re.test(text))?.[1];
  const tonight = /tonight|heute nacht/i.test(text);
  const longStay = /long|unusual|lang/i.test(text);

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
