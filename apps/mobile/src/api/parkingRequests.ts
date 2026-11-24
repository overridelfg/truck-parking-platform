import type {
  ParkingRequest,
  UpdateStatusInput,
} from "@truck-parking-platform/shared";
import { request } from "./client";

const BASE = "/requests";

export const parkingRequestsApi = {
  list: () => request<ParkingRequest[]>(BASE),
  get: (id: string) => request<ParkingRequest>(`${BASE}/${id}`),
  updateStatus: (id: string, input: UpdateStatusInput) =>
    request<ParkingRequest>(`${BASE}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
