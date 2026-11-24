import type { ParkingRequest } from "@truck-parking-platform/shared";

const HOUR = 60 * 60 * 1000;
const iso = (offsetHours: number) =>
  new Date(Date.now() + offsetHours * HOUR).toISOString();

export function createSeedData(): ParkingRequest[] {
  return [
    {
      id: "parking_seed-0001",
      driverName: "Ivan Petrov",
      licensePlate: "B-AB 123",
      truckType: "semi",
      requestedFrom: iso(2),
      requestedUntil: iso(10),
      status: "pending",
      note: "Needs a spot with power hookup",
    },
    {
      id: "parking_seed-0002",
      driverName: "Anna Schmidt",
      licensePlate: "M-XY 456",
      truckType: "tanker",
      requestedFrom: iso(1),
      requestedUntil: iso(9),
      status: "approved",
      parkingSpotId: "A-12",
    },
    {
      id: "parking_seed-0003",
      driverName: "Marek Kowalski",
      licensePlate: "WA 98765",
      truckType: "solo",
      requestedFrom: iso(-3),
      requestedUntil: iso(5),
      status: "checked_in",
      parkingSpotId: "B-03",
    },
    {
      id: "parking_seed-0004",
      driverName: "Luca Rossi",
      licensePlate: "MI 123 AB",
      truckType: "semi",
      requestedFrom: iso(4),
      requestedUntil: iso(100),
      status: "pending",
      note: "Unusually long stay",
    },
    {
      id: "parking_seed-0005",
      driverName: "Jan de Vries",
      licensePlate: "NL-45-XZ",
      truckType: "tanker",
      requestedFrom: iso(-30),
      requestedUntil: iso(-20),
      status: "checked_out",
      parkingSpotId: "C-07",
    },
    {
      id: "parking_seed-0006",
      driverName: "Olga Ivanova",
      licensePlate: "K-ZZ 777",
      truckType: "solo",
      requestedFrom: iso(6),
      requestedUntil: iso(12),
      status: "rejected",
    },
  ];
}
