import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateStatusInput } from "@truck-parking-platform/shared";
import { parkingRequestsApi } from "../api/parkingRequests";

export const queryKeys = {
  list: ["parking-requests"] as const,
  detail: (id: string) => ["parking-requests", id] as const,
};

export function useParkingRequests() {
  return useQuery({
    queryKey: queryKeys.list,
    queryFn: parkingRequestsApi.list,
  });
}

export function useParkingRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => parkingRequestsApi.get(id),
  });
}

export function useUpdateStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStatusInput) =>
      parkingRequestsApi.updateStatus(id, input),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: queryKeys.list });
    },
  });
}
