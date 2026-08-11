import { describe, expect, it } from "vitest";

import {
  countPostBodyLength,
  MAX_POST_BODY_LENGTH,
  validatePostBody,
} from "@/lib/timeline/validation";

describe("countPostBodyLength", () => {
  it("サロゲートペアを1文字として数える", () => {
    expect(countPostBodyLength("🎉")).toBe(1);
    expect(countPostBodyLength("達成🎉")).toBe(3);
  });
});

describe("validatePostBody", () => {
  it("通常の本文を受け付ける", () => {
    expect(validatePostBody("今日の積み上げ")).toEqual({ ok: true });
  });

  it("空文字を弾く", () => {
    expect(validatePostBody("")).toEqual({
      ok: false,
      message: "本文を入力してください",
    });
  });

  it("空白のみの本文を弾く", () => {
    expect(validatePostBody("   \n  ")).toEqual({
      ok: false,
      message: "本文を入力してください",
    });
  });

  it("上限ちょうどの本文は受け付ける", () => {
    expect(validatePostBody("あ".repeat(MAX_POST_BODY_LENGTH))).toEqual({ ok: true });
  });

  it("上限を超える本文を弾く", () => {
    expect(validatePostBody("あ".repeat(MAX_POST_BODY_LENGTH + 1))).toEqual({
      ok: false,
      message: `本文は${MAX_POST_BODY_LENGTH}文字以内で入力してください`,
    });
  });
});
