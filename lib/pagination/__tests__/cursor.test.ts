import { describe, expect, it } from "vitest";

import { compareByCursorOrder, isOlderThanCursor } from "@/lib/pagination/cursor";

describe("compareByCursorOrder", () => {
  it("createdAt が新しい方を先にする", () => {
    const a = { createdAt: "2026-08-02T00:00:00.000Z", id: "a" };
    const b = { createdAt: "2026-08-01T00:00:00.000Z", id: "b" };

    expect(compareByCursorOrder(a, b)).toBeLessThan(0);
    expect(compareByCursorOrder(b, a)).toBeGreaterThan(0);
  });

  it("createdAt が同じ場合は id の降順にする", () => {
    const createdAt = "2026-08-01T00:00:00.000Z";
    const a = { createdAt, id: "b" };
    const b = { createdAt, id: "a" };

    expect(compareByCursorOrder(a, b)).toBeLessThan(0);
  });

  it("完全に同じ場合は 0 を返す", () => {
    const item = { createdAt: "2026-08-01T00:00:00.000Z", id: "a" };

    expect(compareByCursorOrder(item, item)).toBe(0);
  });
});

describe("isOlderThanCursor", () => {
  const cursor = { createdAt: "2026-08-02T00:00:00.000Z", id: "b" };

  it("createdAt がカーソルより古ければ true", () => {
    expect(isOlderThanCursor({ createdAt: "2026-08-01T00:00:00.000Z", id: "z" }, cursor)).toBe(
      true,
    );
  });

  it("createdAt が同じで id がカーソルより小さければ true", () => {
    expect(isOlderThanCursor({ createdAt: cursor.createdAt, id: "a" }, cursor)).toBe(true);
  });

  it("createdAt が同じで id がカーソル以上なら false", () => {
    expect(isOlderThanCursor({ createdAt: cursor.createdAt, id: "c" }, cursor)).toBe(false);
  });

  it("createdAt がカーソルより新しければ false", () => {
    expect(isOlderThanCursor({ createdAt: "2026-08-03T00:00:00.000Z", id: "a" }, cursor)).toBe(
      false,
    );
  });
});
