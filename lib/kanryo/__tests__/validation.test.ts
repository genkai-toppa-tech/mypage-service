import { describe, expect, it } from "vitest";

import { MAX_TASK_BODY_LENGTH, validateTaskBody } from "@/lib/kanryo/validation";

describe("validateTaskBody", () => {
  it("通常の本文を許可する", () => {
    expect(validateTaskBody("水を飲む")).toEqual({ ok: true });
  });

  it("空文字は拒否する", () => {
    expect(validateTaskBody("")).toEqual({ ok: false, message: "本文を入力してください" });
  });

  it("空白のみは拒否する", () => {
    expect(validateTaskBody("   ")).toEqual({ ok: false, message: "本文を入力してください" });
  });

  it(`${MAX_TASK_BODY_LENGTH}文字ちょうどは許可する`, () => {
    expect(validateTaskBody("あ".repeat(MAX_TASK_BODY_LENGTH))).toEqual({ ok: true });
  });

  it(`${MAX_TASK_BODY_LENGTH}文字を超えると拒否する`, () => {
    expect(validateTaskBody("あ".repeat(MAX_TASK_BODY_LENGTH + 1))).toEqual({
      ok: false,
      message: `本文は${MAX_TASK_BODY_LENGTH}文字以内で入力してください`,
    });
  });
});
