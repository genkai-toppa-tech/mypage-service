import { describe, expect, it } from "vitest";

import {
  computeDueAt,
  MAX_DUE_AT_MINUTES,
  resolveDueMinutes,
  validateDueMinutes,
} from "@/lib/kanryo/due-at";

describe("computeDueAt", () => {
  const now = new Date("2026-09-19T00:00:00.000Z");

  it("+1分の制限時刻を計算する", () => {
    expect(computeDueAt(now, 1)).toBe("2026-09-19T00:01:00.000Z");
  });

  it("+5分の制限時刻を計算する", () => {
    expect(computeDueAt(now, 5)).toBe("2026-09-19T00:05:00.000Z");
  });

  it("+30分の制限時刻を計算する", () => {
    expect(computeDueAt(now, 30)).toBe("2026-09-19T00:30:00.000Z");
  });

  it("カスタムの分数でも計算できる", () => {
    expect(computeDueAt(now, 45)).toBe("2026-09-19T00:45:00.000Z");
  });
});

describe("validateDueMinutes", () => {
  it("1以上の整数を許可する", () => {
    expect(validateDueMinutes(45)).toEqual({ ok: true });
  });

  it("0以下は拒否する", () => {
    expect(validateDueMinutes(0)).toEqual({
      ok: false,
      message: "制限時間は1分以上で入力してください",
    });
  });

  it("小数は拒否する", () => {
    expect(validateDueMinutes(1.5)).toEqual({
      ok: false,
      message: "制限時間は整数の分数で入力してください",
    });
  });

  it(`上限（${MAX_DUE_AT_MINUTES}分）を超えると拒否する`, () => {
    expect(validateDueMinutes(MAX_DUE_AT_MINUTES + 1)).toEqual({
      ok: false,
      message: `制限時間は${MAX_DUE_AT_MINUTES}分以内で入力してください`,
    });
  });

  it(`上限（${MAX_DUE_AT_MINUTES}分）ちょうどは許可する`, () => {
    expect(validateDueMinutes(MAX_DUE_AT_MINUTES)).toEqual({ ok: true });
  });
});

describe("resolveDueMinutes", () => {
  // 2026-09-19 09:00:00（ローカル時刻）
  const now = new Date(2026, 8, 19, 9, 0, 0);

  it("プリセットの場合は指定した分数をそのまま返す", () => {
    expect(resolveDueMinutes({ mode: "preset", minutes: 10 }, now)).toBe(10);
  });

  it("時刻指定の場合は現在時刻からの分数に変換する", () => {
    expect(resolveDueMinutes({ mode: "custom", time: "09:30" }, now)).toBe(30);
  });

  it("既に過ぎた時刻を指定した場合は翌日のその時刻として扱う", () => {
    // 08:00 は現在時刻(09:00)より前なので、翌日08:00（23時間後）として扱う
    expect(resolveDueMinutes({ mode: "custom", time: "08:00" }, now)).toBe(23 * 60);
  });

  it("現在時刻ちょうどを指定した場合も翌日のその時刻として扱う", () => {
    expect(resolveDueMinutes({ mode: "custom", time: "09:00" }, now)).toBe(24 * 60);
  });

  it("無効な時刻の場合は NaN を返す", () => {
    expect(resolveDueMinutes({ mode: "custom", time: "" }, now)).toBeNaN();
  });
});
