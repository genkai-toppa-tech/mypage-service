import { describe, expect, it } from "vitest";

import { toJstDateKey } from "@/lib/kanryo/date";

describe("toJstDateKey", () => {
  it("UTC時刻をJSTの日付キーに変換する", () => {
    // UTC 15:00 は JST では翌日 0:00
    expect(toJstDateKey("2026-09-18T15:00:00.000Z")).toBe("2026-09-19");
  });

  it("日付境界をまたがない場合はそのままの日付になる", () => {
    // UTC 14:59 は JST でもまだ当日 23:59
    expect(toJstDateKey("2026-09-18T14:59:00.000Z")).toBe("2026-09-18");
  });
});
