import type {
  AssistantResponse,
  ParkingRequest,
} from "@truck-parking-platform/shared";
import type { Intent } from "./intent";

export type AssistantResult = Omit<AssistantResponse, "source">;

const HOUR = 60 * 60 * 1000;
const LONG_STAY_HOURS = 48;

function overlapsTonight(r: ParkingRequest, now: Date): boolean {
  const start = new Date(now);
  start.setHours(20, 0, 0, 0); // 20:00 - 06:00
  const end = start.getTime() + 10 * HOUR;
  return (
    Date.parse(r.requestedFrom) < end &&
    Date.parse(r.requestedUntil) > start.getTime()
  );
}

export function applyIntent(
  intent: Intent,
  items: ParkingRequest[],
  now = new Date(),
): AssistantResult {
  if (intent.kind === "unknown") {
    return {
      answer:
        'I did not understand. Try: "pending requests", "approved tankers", "requests tonight", "unusually long stays".',
      understood: false,
      matches: [],
    };
  }

  const matches = items.filter((r) => {
    if (intent.statuses && !intent.statuses.includes(r.status)) return false;
    if (intent.truckType && r.truckType !== intent.truckType) return false;
    if (intent.tonight && !overlapsTonight(r, now)) return false;
    if (intent.longStay) {
      const hours =
        (Date.parse(r.requestedUntil) - Date.parse(r.requestedFrom)) / HOUR;
      if (hours < LONG_STAY_HOURS) return false;
    }
    return true;
  });

  const result: AssistantResult = {
    answer: matches.length
      ? `Found ${matches.length} request(s).`
      : "No matching requests.",
    understood: true,
    matches,
  };

  const firstPending = matches.find((r) => r.status === "pending");
  if (firstPending && intent.statuses?.includes("pending")) {
    result.suggestion = {
      requestId: firstPending.id,
      status: "approved",
      reason: `${firstPending.driverName} is waiting for approval.`,
    };
  }
  return result;
}
