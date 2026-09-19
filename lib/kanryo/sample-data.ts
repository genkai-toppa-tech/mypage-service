import type { SeedKanryoTask } from "@/lib/kanryo/repository";
import type { KanryoUser } from "@/lib/kanryo/types";

/**
 * デモ用のダミー塾生。
 * kanryo_tasks の導入までは永続化されないため、動作確認用にその場で用意する。
 */
export const SAMPLE_USERS: readonly KanryoUser[] = [
  { id: "sample-hanako", displayName: "花子", avatarUrl: null },
  { id: "sample-taro", displayName: "太郎", avatarUrl: null },
];

const MINUTE_IN_MS = 60_000;

/**
 * ログイン中の本人1件＋ダミー塾生の投稿を、進行中／時間切れ／完了の3状態が揃うように作る。
 * すべて `now` からの相対時刻なので、いつ開いても状態が破綻しない。
 */
export function createSampleTasks(now: Date, currentUser: KanryoUser): readonly SeedKanryoTask[] {
  const nowMs = now.getTime();
  const at = (offsetMinutes: number) =>
    new Date(nowMs + offsetMinutes * MINUTE_IN_MS).toISOString();

  return [
    {
      id: "sample-task-taro-1",
      authorId: "sample-taro",
      body: "白湯を飲む",
      createdAt: at(-30),
      dueAt: at(-25),
      status: "completed",
      completedAt: at(-27),
    },
    {
      // 時間切れから遅れて完了した例。「完了時に遅れがわかる」表示のデモ用
      id: "sample-task-taro-2",
      authorId: "sample-taro",
      body: "日報を提出する",
      createdAt: at(-60),
      dueAt: at(-55),
      status: "completed",
      completedAt: at(-40),
    },
    {
      id: "sample-task-hanako-1",
      authorId: "sample-hanako",
      body: "日報を書く",
      createdAt: at(-20),
      dueAt: at(-5),
      status: "pending",
    },
    {
      id: "sample-task-mine-1",
      authorId: currentUser.id,
      body: "朝ランに出る",
      createdAt: at(-2),
      dueAt: at(3),
      status: "pending",
    },
    {
      id: "sample-task-hanako-2",
      authorId: "sample-hanako",
      body: "ストレッチをする",
      createdAt: at(-1),
      dueAt: at(4),
      status: "pending",
    },
  ];
}
