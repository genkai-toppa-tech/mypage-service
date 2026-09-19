"use client";

import { useState } from "react";

import { UserAvatar } from "@/components/user/UserAvatar";
import { formatOverrun, formatRemaining } from "@/lib/kanryo/format";
import { getTaskDisplayState } from "@/lib/kanryo/status";
import type { KanryoTask } from "@/lib/kanryo/types";
import { formatRelativeTime } from "@/lib/timeline/format";

type TaskCardProps = {
  task: KanryoTask;
  currentUserId: string;
  /** カウントダウン・期限切れ判定に使う現在時刻。 */
  now: Date;
  onComplete: (id: string) => Promise<void>;
};

export function TaskCard({ task, currentUserId, now, onComplete }: TaskCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwnTask = task.author.id === currentUserId;
  const displayState = getTaskDisplayState(task, now);
  const overrun = task.completedAt !== null ? formatOverrun(task.dueAt, task.completedAt) : null;

  async function handleComplete() {
    setIsSubmitting(true);
    setError(null);

    try {
      await onComplete(task.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "完了にできませんでした");
      setIsSubmitting(false);
    }
  }

  return (
    <article className="border-border flex gap-3 border-b px-4 py-4">
      <UserAvatar displayName={task.author.displayName} avatarUrl={task.author.avatarUrl} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold">{task.author.displayName}</span>
          <time dateTime={task.createdAt} className="text-muted-foreground text-xs">
            {formatRelativeTime(task.createdAt, now)}
          </time>
        </div>

        <p className="mt-1 text-sm">
          {task.dailySeq}. {task.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {displayState === "completed" && task.completedAt !== null && (
            <span className="text-primary text-xs font-medium">
              ✓ 完了（{formatRelativeTime(task.completedAt, now)}）
              {overrun !== null && (
                <span className="text-muted-foreground ml-1 font-normal">
                  時間切れから{overrun}遅れ
                </span>
              )}
            </span>
          )}

          {displayState === "inProgress" && (
            <span className="text-muted-foreground text-xs tabular-nums">
              残り {formatRemaining(task.dueAt, now)}
            </span>
          )}

          {displayState === "expired" && (
            <span className="text-muted-foreground text-xs">時間切れ</span>
          )}

          {isOwnTask && task.status === "pending" && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            >
              完了にする
            </button>
          )}
        </div>

        {error !== null && (
          <p role="alert" className="text-destructive mt-1 text-xs">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
