/**
 * 制限時間までの残り時間を "m:ss" 形式にする。
 * 期限を過ぎている場合は "0:00" を返す（表示側で「時間切れ」に出し分ける）。
 */
export function formatRemaining(dueAt: string, now: Date): string {
  const diffMs = new Date(dueAt).getTime() - now.getTime();

  if (diffMs <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * 制限時間を過ぎてから完了するまでの遅れ時間を表す文言にする。
 * 期限内に完了した場合（completedAt <= dueAt）は null を返す。
 */
export function formatOverrun(dueAt: string, completedAt: string): string | null {
  const overrunMs = new Date(completedAt).getTime() - new Date(dueAt).getTime();

  if (overrunMs <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(overrunMs / 60_000);

  if (totalMinutes < 1) {
    return "1分未満";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours === 0 ? `${minutes}分` : `${hours}時間${minutes}分`;
}
