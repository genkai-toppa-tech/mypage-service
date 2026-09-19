"use client";

import { useEffect, useRef, useState } from "react";

import { TaskComposerButton } from "@/components/kanryo/TaskComposerButton";
import { TaskList } from "@/components/kanryo/TaskList";
import type { Profile } from "@/lib/auth/types";
import {
  createSupabaseKanryoRepository,
  toKanryoTask,
  upsertTask,
  type TaskCursor,
} from "@/lib/kanryo/repository";
import type { KanryoTask, KanryoUser } from "@/lib/kanryo/types";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

/** 1回の読み込みで取得する件数。 */
const PAGE_SIZE = 20;

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type KanryoTimelineProps = {
  currentUser: Profile;
  initialTasks: readonly KanryoTask[];
  initialCursor: TaskCursor | null;
};

export function KanryoTimeline({ currentUser, initialTasks, initialCursor }: KanryoTimelineProps) {
  const [supabase] = useState(() => createClient());
  const [repository] = useState(() => createSupabaseKanryoRepository(supabase));
  const [tasks, setTasks] = useState<readonly KanryoTask[]>(initialTasks);
  const [cursor, setCursor] = useState<TaskCursor | null>(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Realtime の payload には投稿者名・アバターが含まれないため、
  // 一度取得した投稿者情報をここに溜めておき、以降は追加の通信なしで補完する。
  const profilesCache = useRef(new Map<string, KanryoUser>());

  useEffect(() => {
    for (const task of tasks) {
      profilesCache.current.set(task.author.id, task.author);
    }
  }, [tasks]);

  // 残り時間のカウントダウン・期限切れ判定を1秒ごとに更新する
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function resolveTask(row: Tables<"kanryo_tasks">): Promise<KanryoTask | null> {
      let author = profilesCache.current.get(row.user_id);

      if (author === undefined) {
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .eq("id", row.user_id)
          .maybeSingle();

        if (data === null) {
          return null;
        }

        author = { id: data.id, displayName: data.display_name, avatarUrl: data.avatar_url };
        profilesCache.current.set(author.id, author);
      }

      return toKanryoTask(row, author);
    }

    const channel = supabase
      .channel("kanryo-tasks")
      .on<Tables<"kanryo_tasks">>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "kanryo_tasks" },
        (payload) => {
          resolveTask(payload.new).then((task) => {
            if (task !== null) {
              setTasks((current) => upsertTask(current, task));
            }
          });
        },
      )
      .on<Tables<"kanryo_tasks">>(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "kanryo_tasks" },
        (payload) => {
          resolveTask(payload.new).then((task) => {
            if (task !== null) {
              setTasks((current) => upsertTask(current, task));
            }
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleCreate({ body, dueMinutes }: { body: string; dueMinutes: number }) {
    const created = await repository.createTask({
      authorId: currentUser.id,
      body,
      dueMinutes,
    });

    setTasks((current) => upsertTask(current, created));
  }

  async function handleComplete(id: string) {
    // 押した瞬間にUIへ反映する（楽観的更新）。失敗したら元の状態に戻す
    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, status: "completed", completedAt: new Date().toISOString() }
          : task,
      ),
    );

    try {
      const updated = await repository.completeTask({ id, authorId: currentUser.id });

      setTasks((current) => upsertTask(current, updated));
    } catch (caught) {
      setTasks(previousTasks);
      throw caught;
    }
  }

  async function handleLoadMore() {
    if (cursor === null || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const page = await repository.listTasks({ limit: PAGE_SIZE, cursor });

      setTasks((current) => [...current, ...page.tasks]);
      setCursor(page.nextCursor);
    } catch (caught) {
      setError(toMessage(caught, "追加の読み込みに失敗しました"));
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div>
      <TaskList
        tasks={tasks}
        currentUserId={currentUser.id}
        now={now}
        hasMore={cursor !== null}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        onComplete={handleComplete}
      />

      {error !== null && (
        <p role="alert" className="text-destructive px-4 pb-4 text-center text-sm">
          {error}
        </p>
      )}

      <TaskComposerButton onSubmit={handleCreate} />
    </div>
  );
}
