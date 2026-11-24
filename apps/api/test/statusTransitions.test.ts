import { describe, expect, it } from "vitest";
import { canTransition, isFinal } from "../src/domain/statusTransitions";

describe("status transitions", () => {
  it.each([
    ["pending", "approved"],
    ["pending", "rejected"],
    ["approved", "checked_in"],
    ["checked_in", "checked_out"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each([
    ["pending", "checked_in"],
    ["pending", "checked_out"],
    ["approved", "rejected"],
    ["approved", "checked_out"],
    ["checked_in", "approved"],
    ["rejected", "approved"],
    ["checked_out", "checked_in"],
  ] as const)("forbids %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it("marks rejected and checked_out as final", () => {
    expect(isFinal("rejected")).toBe(true);
    expect(isFinal("checked_out")).toBe(true);
    expect(isFinal("pending")).toBe(false);
  });
});
