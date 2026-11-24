import type { ParkingRequest } from "@truck-parking-platform/shared";
import type { ParkingRequestRepository } from "./parkingRequestRepository";

export class InMemoryParkingRequestRepository implements ParkingRequestRepository {
  private items = new Map<string, ParkingRequest>();

  constructor(initial: ParkingRequest[] = []) {
    for (const item of initial) this.items.set(item.id, item);
  }

  async list() {
    return [...this.items.values()];
  }
  async get(id: string) {
    return this.items.get(id);
  }
  async create(item: ParkingRequest) {
    this.items.set(item.id, item);
    return item;
  }
  async update(id: string, patch: Partial<ParkingRequest>) {
    const current = this.items.get(id);
    if (!current) return undefined;
    const updated = { ...current, ...patch };
    this.items.set(id, updated);
    return updated;
  }
  async delete(id: string) {
    return this.items.delete(id);
  }
}
