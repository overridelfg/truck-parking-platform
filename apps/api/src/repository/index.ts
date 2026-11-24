import { InMemoryParkingRequestRepository } from "./inMemoryRepository";
import { createSeedData } from "./seed";

const useSeed = process.env.SEED_DATA !== "false";

export const repository = new InMemoryParkingRequestRepository(
  useSeed ? createSeedData() : [],
);
