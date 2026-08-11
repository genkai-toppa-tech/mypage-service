const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
/** これを超えたら相対表記をやめ、日付そのものを表示する。 */
const RELATIVE_LIMIT_IN_MS = 7 * DAY_IN_MS;

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * 投稿日時をタイムライン向けの相対表記にする。
 * テストで固定できるよう、現在時刻は引数で受け取る。
 */
export function formatRelativeTime(isoDate: string, now: Date): string {
  const target = new Date(isoDate);
  const elapsed = now.getTime() - target.getTime();

  if (elapsed < MINUTE_IN_MS) {
    return "たった今";
  }

  if (elapsed < HOUR_IN_MS) {
    return `${Math.floor(elapsed / MINUTE_IN_MS)}分前`;
  }

  if (elapsed < DAY_IN_MS) {
    return `${Math.floor(elapsed / HOUR_IN_MS)}時間前`;
  }

  if (elapsed < RELATIVE_LIMIT_IN_MS) {
    return `${Math.floor(elapsed / DAY_IN_MS)}日前`;
  }

  return dateFormatter.format(target);
}
