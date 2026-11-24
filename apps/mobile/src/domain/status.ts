import type { ParkingStatus } from "@truck-parking-platform/shared";

export const ALLOWED_TRANSITIONS: Record<ParkingStatus, ParkingStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["checked_in"],
  checked_in: ["checked_out"],
  rejected: [],
  checked_out: [],
};

export const isFinalStatus = (s: ParkingStatus) =>
  ALLOWED_TRANSITIONS[s].length === 0;

export const STATUS_LABELS: Record<ParkingStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  checked_in: "Checked in",
  checked_out: "Checked out",
};

export const STATUS_COLORS: Record<ParkingStatus, string> = {
  pending: "#d97706",
  approved: "#2563eb",
  rejected: "#dc2626",
  checked_in: "#16a34a",
  checked_out: "#6b7280",
};
