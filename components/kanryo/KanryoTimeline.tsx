"use client";

import { useEffect, useState } from "react";

import { TaskComposerButton } from "@/components/kanryo/TaskComposerButton";
import { TaskList } from "@/components/kanryo/TaskList";
import type { Profile } from "@/lib/auth/types";
import { createInMemoryKanryoRepository } from "@/lib/kanryo/repository";
import { createSampleTasks, SAMPLE_USERS } from "@/lib/kanryo/sample-data";
import type { KanryoTask } from "@/lib/kanryo/types";

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function KanryoTimeline({ currentUser }: { currentUser: Profile }) {
  // NOTE: kanryo_tasks テーブルの導入までは、投稿はこのブラウザのメモリ上にしか残らない。
  // 動作確認用に、本人に加えてダミー塾生数名分のサンプル投稿をその場で用意する。
  const [repository] = useState(() => {
    const now = new Date();

    return createInMemoryKanryoRepository({
      users: [currentUser, ...SAMPLE_USERS],
      seedTasks: createSampleTasks(now, currentUser),
    });
  });
  const [tasks, setTasks] = useState<readonly KanryoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let isActive = true;

    repository
      .listTasks()
      .then((list) => {
        if (isActive) {
          setTasks(list);
        }
      })
      .catch((caught: unknown) => {
        if (isActive) {
          setError(toMessage(caught, "完了の間の読み込みに失敗しました"));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [repository]);

  // 残り時間のカウントダウン・期限切れ判定を1秒ごとに更新する
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

  async function handleCreate({ body, dueMinutes }: { body: string; dueMinutes: number }) {
    const created = await repository.createTask({
      authorId: currentUser.id,
      body,
      dueMinutes,
    });

    setTasks((current) => [created, ...current]);
  }

  async function handleComplete(id: string) {
    const updated = await repository.completeTask({ id, authorId: currentUser.id });

    setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
  }

  return (
    <div>
      {isLoading ? (
        <p className="text-muted-foreground px-4 py-10 text-center text-sm">読み込み中...</p>
      ) : (
        <TaskList
          tasks={tasks}
          currentUserId={currentUser.id}
          now={now}
          onComplete={handleComplete}
        />
      )}

      {error !== null && (
        <p role="alert" className="text-destructive px-4 pb-4 text-center text-sm">
          {error}
        </p>
      )}

      <TaskComposerButton onSubmit={handleCreate} />
    </div>
  );
}
