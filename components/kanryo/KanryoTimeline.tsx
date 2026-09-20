"use client";

import { useEffect, useRef, useState } from "react";

import { TaskComposerButton } from "@/components/kanryo/TaskComposerButton";
import { TaskComposerPanel } from "@/components/kanryo/TaskComposerPanel";
import { TaskList } from "@/components/kanryo/TaskList";
import type { Profile } from "@/lib/auth/types";
import { addLike, isLikedBy, removeLike, type TaskLikes } from "@/lib/kanryo/likes";
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
  initialLikes: TaskLikes;
};

export function KanryoTimeline({
  currentUser,
  initialTasks,
  initialCursor,
  initialLikes,
}: KanryoTimelineProps) {
  const [supabase] = useState(() => createClient());
  const [repository] = useState(() => createSupabaseKanryoRepository(supabase));
  const [tasks, setTasks] = useState<readonly KanryoTask[]>(initialTasks);
  const [cursor, setCursor] = useState<TaskCursor | null>(initialCursor);
  const [likes, setLikes] = useState<TaskLikes>(initialLikes);
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
    async function resolveUser(userId: string): Promise<KanryoUser | null> {
      const cached = profilesCache.current.get(userId);

      if (cached !== undefined) {
        return cached;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (data === null) {
        return null;
      }

      const user = { id: data.id, displayName: data.display_name, avatarUrl: data.avatar_url };
      profilesCache.current.set(user.id, user);

      return user;
    }

    async function resolveTask(row: Tables<"kanryo_tasks">): Promise<KanryoTask | null> {
      const author = await resolveUser(row.user_id);

      return author === null ? null : toKanryoTask(row, author);
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
      .on<Tables<"kanryo_task_likes">>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "kanryo_task_likes" },
        (payload) => {
          resolveUser(payload.new.user_id).then((user) => {
            if (user !== null) {
              setLikes((current) => addLike(current, payload.new.task_id, user));
            }
          });
        },
      )
      .on<Tables<"kanryo_task_likes">>(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "kanryo_task_likes" },
        (payload) => {
          // DELETE の payload.old には主キー列（task_id, user_id）のみ含まれる
          const taskId = payload.old.task_id;
          const userId = payload.old.user_id;

          if (taskId !== undefined && userId !== undefined) {
            setLikes((current) => removeLike(current, taskId, userId));
          }
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
      setLikes((current) => ({ ...current, ...page.likes }));
      setCursor(page.nextCursor);
    } catch (caught) {
      setError(toMessage(caught, "追加の読み込みに失敗しました"));
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleToggleLike(taskId: string) {
    // 押した瞬間にUIへ反映する（楽観的更新）。失敗したら元の状態に戻す
    const alreadyLiked = isLikedBy(likes[taskId] ?? [], currentUser.id);
    const previousLikes = likes;

    setLikes((current) =>
      alreadyLiked
        ? removeLike(current, taskId, currentUser.id)
        : addLike(current, taskId, currentUser),
    );

    try {
      if (alreadyLiked) {
        await repository.unlikeTask({ taskId, userId: currentUser.id });
      } else {
        await repository.likeTask({ taskId, userId: currentUser.id });
      }
    } catch (caught) {
      setLikes(previousLikes);
      throw caught;
    }
  }

  return (
    <div>
      <TaskComposerPanel onSubmit={handleCreate} />

      <TaskList
        tasks={tasks}
        currentUserId={currentUser.id}
        now={now}
        likes={likes}
        hasMore={cursor !== null}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        onComplete={handleComplete}
        onToggleLike={handleToggleLike}
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
