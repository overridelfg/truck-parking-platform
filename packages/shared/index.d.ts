export type TruckType = "solo" | "semi" | "tanker";

export type ParkingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "checked_in"
  | "checked_out";

export interface ParkingRequest {
  id: string;
  driverName: string;
  licensePlate: string;
  truckType: TruckType;
  requestedFrom: string;
  requestedUntil: string;
  status: ParkingStatus;
  parkingSpotId?: string;
  note?: string;
}

export interface CreateParkingRequestInput {
  driverName: string;
  licensePlate: string;
  truckType: TruckType;
  requestedFrom: string;
  requestedUntil: string;
  note?: string;
}

export interface UpdateStatusInput {
  status: ParkingStatus;
  parkingSpotId?: string;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
