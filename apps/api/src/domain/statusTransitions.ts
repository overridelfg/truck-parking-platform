import type { ParkingStatus } from "@truck-parking-platform/shared";

export const ALLOWED_TRANSITIONS: Record<ParkingStatus, ParkingStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["checked_in"],
  checked_in: ["checked_out"],
  rejected: [],
  checked_out: [],
};

export function canTransition(from: ParkingStatus, to: ParkingStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isFinal(status: ParkingStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}
