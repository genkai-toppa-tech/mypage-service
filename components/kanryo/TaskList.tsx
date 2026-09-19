"use client";

import { TaskCard } from "@/components/kanryo/TaskCard";
import type { TaskLikes } from "@/lib/kanryo/likes";
import type { KanryoTask } from "@/lib/kanryo/types";

type TaskListProps = {
  tasks: readonly KanryoTask[];
  currentUserId: string;
  now: Date;
  likes: TaskLikes;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onComplete: (id: string) => Promise<void>;
  onToggleLike: (id: string) => Promise<void>;
};

/** 新着順に並んだタスク一覧。追加読み込みは keyset カーソルで行う。 */
export function TaskList({
  tasks,
  currentUserId,
  now,
  likes,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onComplete,
  onToggleLike,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-10 text-center text-sm">
        まだ投稿がありません。最初のタスクを投稿してみましょう。
      </p>
    );
  }

  return (
    <>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              currentUserId={currentUserId}
              now={now}
              likes={likes[task.id] ?? []}
              onComplete={onComplete}
              onToggleLike={onToggleLike}
            />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="px-4 py-4 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
          >
            {isLoadingMore ? "読み込み中..." : "もっと見る"}
          </button>
        </div>
      )}
    </>
  );
}
