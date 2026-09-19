import { describe, expect, it } from "vitest";

import { getTaskDisplayState } from "@/lib/kanryo/status";

const now = new Date("2026-09-19T00:00:00.000Z");

describe("getTaskDisplayState", () => {
  it("完了済みは status に関わらず completed", () => {
    expect(
      getTaskDisplayState({ status: "completed", dueAt: "2026-09-19T00:05:00.000Z" }, now),
    ).toBe("completed");
  });

  it("制限時刻より前の未完了は inProgress", () => {
    expect(getTaskDisplayState({ status: "pending", dueAt: "2026-09-19T00:05:00.000Z" }, now)).toBe(
      "inProgress",
    );
  });

  it("制限時刻を過ぎた未完了は expired", () => {
    expect(getTaskDisplayState({ status: "pending", dueAt: "2026-09-18T23:55:00.000Z" }, now)).toBe(
      "expired",
    );
  });

  it("制限時刻ちょうどの未完了は expired", () => {
    expect(getTaskDisplayState({ status: "pending", dueAt: now.toISOString() }, now)).toBe(
      "expired",
    );
  });
});
