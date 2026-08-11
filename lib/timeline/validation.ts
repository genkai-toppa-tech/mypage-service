/** 本文の最大文字数。DB側にも同じ値で CHECK 制約を張る想定。 */
export const MAX_POST_BODY_LENGTH = 1000;

export type ValidationResult = { ok: true } | { ok: false; message: string };

/**
 * 表示・制限に使う文字数。
 * 絵文字などのサロゲートペアを2文字と数えないようコードポイント単位で数える。
 */
export function countPostBodyLength(body: string): number {
  return [...body].length;
}

/** 投稿本文のバリデーション。空文字・空白のみ・文字数超過を弾く。 */
export function validatePostBody(body: string): ValidationResult {
  if (body.trim() === "") {
    return { ok: false, message: "本文を入力してください" };
  }

  if (countPostBodyLength(body) > MAX_POST_BODY_LENGTH) {
    return {
      ok: false,
      message: `本文は${MAX_POST_BODY_LENGTH}文字以内で入力してください`,
    };
  }

  return { ok: true };
}
