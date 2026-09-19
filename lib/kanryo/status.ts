import type { KanryoTask } from "@/lib/kanryo/types";

/**
 * タイムライン表示上の3状態。
 * `expired` はDBに持たせず、due_at と現在時刻の比較でのみ判定する
 * （期限切れは時間経過で自動的に決まるため、書き込む主体がいない）。
 */
export type TaskDisplayState = "inProgress" | "expired" | "completed";

export function getTaskDisplayState(
  task: Pick<KanryoTask, "status" | "dueAt">,
  now: Date,
): TaskDisplayState {
  if (task.status === "completed") {
    return "completed";
  }

  return new Date(task.dueAt).getTime() <= now.getTime() ? "expired" : "inProgress";
}
