import type { ParkingStatus, TruckType } from "@truck-parking-platform/shared";

export type Intent =
  | {
      kind: "filter";
      statuses?: ParkingStatus[];
      truckType?: TruckType;
      tonight?: boolean;
      longStay?: boolean;
    }
  | { kind: "unknown" };

const STATUS_WORDS: [RegExp, ParkingStatus][] = [
  [/pending|waiting|ausstehend/i, "pending"],
  [/approved|genehmigt/i, "approved"],
  [/rejected|declined|abgelehnt/i, "rejected"],
  [/checked[ _-]?in|arrived/i, "checked_in"],
  [/checked[ _-]?out|departed|left/i, "checked_out"],
];

const TYPE_WORDS: [RegExp, TruckType][] = [
  [/tanker/i, "tanker"],
  [/semi/i, "semi"],
  [/solo/i, "solo"],
];

export function parseQuery(text: string): Intent {
  const statuses = STATUS_WORDS.filter(([re]) => re.test(text)).map(
    ([, s]) => s,
  );
  const truckType = TYPE_WORDS.find(([re]) => re.test(text))?.[1];
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
