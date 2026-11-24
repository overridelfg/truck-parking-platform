import type { ParkingRequest } from "@truck-parking-platform/shared";

export interface ParkingRequestRepository {
  list(): Promise<ParkingRequest[]>;
  get(id: string): Promise<ParkingRequest | undefined>;
  create(item: ParkingRequest): Promise<ParkingRequest>;
  update(
    id: string,
    patch: Partial<ParkingRequest>,
  ): Promise<ParkingRequest | undefined>;
  delete(id: string): Promise<boolean>;
}
