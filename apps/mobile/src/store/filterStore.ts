import { create } from "zustand";
import type { ParkingStatus } from "@truck-parking-platform/shared";

type FilterState = {
  status: ParkingStatus | "all";
  setStatus: (status: ParkingStatus | "all") => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  status: "all",
  setStatus: (status) => set({ status }),
}));
