"use client";

import { TaskCard } from "@/components/kanryo/TaskCard";
import type { KanryoTask } from "@/lib/kanryo/types";

type TaskListProps = {
  tasks: readonly KanryoTask[];
  currentUserId: string;
  now: Date;
  onComplete: (id: string) => Promise<void>;
};

/** 新着順に並んだタスク一覧。 */
export function TaskList({ tasks, currentUserId, now, onComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-10 text-center text-sm">
        まだ投稿がありません。最初のタスクを投稿してみましょう。
      </p>
    );
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} currentUserId={currentUserId} now={now} onComplete={onComplete} />
        </li>
      ))}
    </ul>
  );
}
