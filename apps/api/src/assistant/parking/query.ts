import type {
  AssistantResponse,
  ParkingRequest,
} from "@truck-parking-platform/shared";
import { LONG_STAY_HOURS, NIGHT_END_HOUR, NIGHT_START_HOUR } from "./constants";
import type { ParkingFilter } from "./schema";

export type AssistantResult = Omit<AssistantResponse, "source">;

const HOUR = 60 * 60 * 1000;

function tonightWindow(now: Date): { start: number; end: number } {
  const start = new Date(now);
  start.setHours(NIGHT_START_HOUR, 0, 0, 0);
  if (now.getHours() < NIGHT_END_HOUR) start.setDate(start.getDate() - 1);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(NIGHT_END_HOUR, 0, 0, 0);
  return { start: start.getTime(), end: end.getTime() };
}

function overlapsTonight(r: ParkingRequest, now: Date): boolean {
  const { start, end } = tonightWindow(now);
  return (
    Date.parse(r.requestedFrom) < end && Date.parse(r.requestedUntil) > start
  );
}

function isLongStay(r: ParkingRequest): boolean {
  const hours =
    (Date.parse(r.requestedUntil) - Date.parse(r.requestedFrom)) / HOUR;
  return hours > LONG_STAY_HOURS;
}

export function applyParkingRequestFilter(
  filter: ParkingFilter,
  items: ParkingRequest[],
  now = new Date(),
): AssistantResult {
  if (filter.kind === "unknown") {
    return {
      answer:
        'I did not understand. Try: "pending requests", "approved tankers", "requests tonight", "unusually long stays".',
      understood: false,
      matches: [],
    };
  }

  const matches = items.filter((r) => {
    if (filter.statuses && !filter.statuses.includes(r.status)) return false;
    if (filter.truckType && r.truckType !== filter.truckType) return false;
    if (filter.tonight && !overlapsTonight(r, now)) return false;
    if (filter.longStay && !isLongStay(r)) return false;
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
  if (firstPending && filter.statuses?.includes("pending")) {
    result.suggestion = {
      requestId: firstPending.id,
      status: "approved",
      reason: `${firstPending.driverName} is waiting for approval.`,
    };
  }

  return result;
}
