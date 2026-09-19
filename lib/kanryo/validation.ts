/** 本文の最大文字数。つぶやき（1000文字）より短い、宣言向けの上限。 */
export const MAX_TASK_BODY_LENGTH = 140;

export type ValidationResult = { ok: true } | { ok: false; message: string };

/**
 * 表示・制限に使う文字数。
 * 絵文字などのサロゲートペアを2文字と数えないようコードポイント単位で数える。
 */
export function countTaskBodyLength(body: string): number {
  return [...body].length;
}

/** タスク本文のバリデーション。空文字・空白のみ・文字数超過を弾く。 */
export function validateTaskBody(body: string): ValidationResult {
  if (body.trim() === "") {
    return { ok: false, message: "本文を入力してください" };
  }

  if (countTaskBodyLength(body) > MAX_TASK_BODY_LENGTH) {
    return {
      ok: false,
      message: `本文は${MAX_TASK_BODY_LENGTH}文字以内で入力してください`,
    };
  }

  return { ok: true };
}
