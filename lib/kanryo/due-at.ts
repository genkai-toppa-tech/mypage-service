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

/**
 * 制限時間の選択内容。
 * プリセットチップ（現在時刻からの相対分数）と、時刻指定（"HH:mm"）の2通り。
 */
export type DueAtSelection = { mode: "preset"; minutes: number } | { mode: "custom"; time: string };

/** "HH:mm" を、今日中ならその時刻、既に過ぎていれば翌日のその時刻の Date にする。 */
function nextOccurrenceOf(time: string, now: Date): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

/**
 * 選択内容から、投稿時点を起点とした分数に解決する。
 * 時刻指定の場合、投稿するタイミングによって残り分数が変わるため、
 * （プリセットのように固定した分数を保持するのではなく）投稿の直前に呼び出す想定。
 */
export function resolveDueMinutes(selection: DueAtSelection, now: Date): number {
  if (selection.mode === "preset") {
    return selection.minutes;
  }

  const target = nextOccurrenceOf(selection.time, now);

  return Math.ceil((target.getTime() - now.getTime()) / 60_000);
}
