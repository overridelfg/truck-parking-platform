import { beforeEach, describe, expect, it } from "vitest";
import type { ParkingRequest } from "@truck-parking-platform/shared";
import { InMemoryParkingRequestRepository } from "../src/repository/inMemoryRepository";

const item: ParkingRequest = {
  id: "parking_1",
  driverName: "Kirill",
  licensePlate: "B-AB 123",
  truckType: "solo",
  requestedFrom: "2026-11-25T10:00:00Z",
  requestedUntil: "2026-11-25T18:00:00Z",
  status: "pending",
};

describe("InMemoryParkingRequestRepository", () => {
  let repo: InMemoryParkingRequestRepository;

  beforeEach(() => {
    repo = new InMemoryParkingRequestRepository();
  });

  it("creates and retrieves an item", async () => {
    await repo.create(item);
    expect(await repo.get("parking_1")).toEqual(item);
    expect(await repo.list()).toHaveLength(1);
  });

  it("updates an existing item", async () => {
    await repo.create(item);
    const updated = await repo.update("parking_1", {
      status: "approved",
      parkingSpotId: "A-12",
    });
    expect(updated?.status).toBe("approved");
    expect(updated?.parkingSpotId).toBe("A-12");
  });

  it("returns undefined when updating a missing item", async () => {
    expect(await repo.update("nope", { status: "approved" })).toBeUndefined();
  });

  it("deletes an item", async () => {
    await repo.create(item);
    expect(await repo.delete("parking_1")).toBe(true);
    expect(await repo.delete("parking_1")).toBe(false);
  });
});
