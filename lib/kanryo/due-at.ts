/** 制限時間のワンタップ設定用の選択肢（分）。 */
export const DUE_AT_MINUTE_PRESETS = [1, 5, 10, 15, 20, 30] as const;

/** ワンタップボタンを使わない場合の初期値（分）。 */
export const DEFAULT_DUE_AT_MINUTES = 5;

export const MIN_DUE_AT_MINUTES = 1;
/** カスタム入力の上限。24時間。 */
export const MAX_DUE_AT_MINUTES = 24 * 60;

export type ValidationResult = { ok: true } | { ok: false; message: string };

/** カスタム入力された分数のバリデーション。整数・範囲外を弾く。 */
export function validateDueMinutes(minutes: number): ValidationResult {
  if (!Number.isInteger(minutes)) {
    return { ok: false, message: "制限時間は整数の分数で入力してください" };
  }

  if (minutes < MIN_DUE_AT_MINUTES) {
    return { ok: false, message: `制限時間は${MIN_DUE_AT_MINUTES}分以上で入力してください` };
  }

  if (minutes > MAX_DUE_AT_MINUTES) {
    return { ok: false, message: `制限時間は${MAX_DUE_AT_MINUTES}分以内で入力してください` };
  }

  return { ok: true };
}

/** 投稿時に選んだ分数から制限時刻（ISO8601）を計算する。 */
export function computeDueAt(now: Date, minutes: number): string {
  return new Date(now.getTime() + minutes * 60_000).toISOString();
}
