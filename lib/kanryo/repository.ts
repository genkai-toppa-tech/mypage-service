import type { SupabaseClient } from "@supabase/supabase-js";

import { computeDueAt, validateDueMinutes } from "@/lib/kanryo/due-at";
import type { TaskLikes } from "@/lib/kanryo/likes";
import type { KanryoTask, KanryoUser } from "@/lib/kanryo/types";
import { validateTaskBody } from "@/lib/kanryo/validation";
import { compareByCursorOrder, type Cursor } from "@/lib/pagination/cursor";
import type { Database, Tables, TablesInsert } from "@/lib/supabase/database.types";

export type TaskCursor = Cursor;

export type ListTasksParams = {
  limit: number;
  /** 先頭ページを取得する場合は未指定または null。 */
  cursor?: TaskCursor | null;
};

export type TaskPage = {
  tasks: KanryoTask[];
  /** 次ページが存在しない場合は null。 */
  nextCursor: TaskCursor | null;
  /** 取得したタスクぶんの「いいね」。タスクの更新とは独立に管理する。 */
  likes: TaskLikes;
};

/**
 * 完了の間の永続化層。kanryo_tasks / kanryo_task_likes テーブルに対する読み書きを行う。
 */
export interface KanryoRepository {
  listTasks(params: ListTasksParams): Promise<TaskPage>;
  createTask(input: { authorId: string; body: string; dueMinutes: number }): Promise<KanryoTask>;
  completeTask(input: { id: string; authorId: string }): Promise<KanryoTask>;
  likeTask(input: { taskId: string; userId: string }): Promise<void>;
  unlikeTask(input: { taskId: string; userId: string }): Promise<void>;
}

const TASK_SELECT_COLUMNS =
  "id, body, due_at, status, completed_at, daily_seq, created_at, user_id, profiles(id, display_name, avatar_url)";

/** 一覧取得時のみ、いいねしたユーザーもあわせて埋め込み取得する。 */
const TASK_SELECT_COLUMNS_WITH_LIKES = `${TASK_SELECT_COLUMNS}, kanryo_task_likes(user_id, profiles(id, display_name, avatar_url))`;

type TaskRow = Pick<
  Tables<"kanryo_tasks">,
  "id" | "body" | "due_at" | "status" | "completed_at" | "daily_seq" | "created_at"
>;

type ProfileColumns = Pick<Tables<"profiles">, "id" | "display_name" | "avatar_url">;

type TaskRowWithProfile = TaskRow & {
  profiles: ProfileColumns | null;
};

type TaskLikeRow = {
  user_id: string;
  profiles: ProfileColumns | null;
};

type TaskRowWithProfileAndLikes = TaskRowWithProfile & {
  kanryo_task_likes: TaskLikeRow[];
};

function toKanryoUser(profile: ProfileColumns): KanryoUser {
  return { id: profile.id, displayName: profile.display_name, avatarUrl: profile.avatar_url };
}

/** いいねの埋め込み取得結果を、いいねしたユーザーの一覧に変換する。 */
function toLikeUsers(rows: readonly TaskLikeRow[]): KanryoUser[] {
  return rows
    .filter((row): row is TaskLikeRow & { profiles: ProfileColumns } => row.profiles !== null)
    .map((row) => toKanryoUser(row.profiles));
}

/** DBの行（＋投稿者情報）からアプリ側の型に変換する。 */
export function toKanryoTask(row: TaskRow, author: KanryoUser): KanryoTask {
  return {
    id: row.id,
    author,
    body: row.body,
    dueAt: row.due_at,
    status: row.status,
    completedAt: row.completed_at,
    dailySeq: row.daily_seq,
    createdAt: row.created_at,
  };
}

function toKanryoTaskFromJoinedRow(row: TaskRowWithProfile): KanryoTask {
  if (row.profiles === null) {
    throw new Error(`投稿者が見つかりません: ${row.id}`);
  }

  return toKanryoTask(row, toKanryoUser(row.profiles));
}

export function createSupabaseKanryoRepository(
  supabase: SupabaseClient<Database>,
): KanryoRepository {
  return {
    async listTasks({ limit, cursor }) {
      let query = supabase
        .from("kanryo_tasks")
        .select(TASK_SELECT_COLUMNS_WITH_LIKES)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(limit + 1);

      // (created_at, id) の複合カーソル条件。並び順 (created_at desc, id desc) の
      // 「カーソルより後ろ」を PostgREST の or() で組み立てる
      if (cursor != null) {
        query = query.or(
          `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
        );
      }

      const { data, error } = await query;

      if (error !== null) {
        throw new Error(error.message);
      }

      const rows = data as unknown as TaskRowWithProfileAndLikes[];
      const hasMore = rows.length > limit;
      const page = hasMore ? rows.slice(0, limit) : rows;
      const last = page.at(-1);

      return {
        tasks: page.map(toKanryoTaskFromJoinedRow),
        nextCursor:
          hasMore && last !== undefined ? { createdAt: last.created_at, id: last.id } : null,
        likes: Object.fromEntries(page.map((row) => [row.id, toLikeUsers(row.kanryo_task_likes)])),
      };
    },

    async createTask({ authorId, body, dueMinutes }) {
      const bodyValidation = validateTaskBody(body);

      if (!bodyValidation.ok) {
        throw new Error(bodyValidation.message);
      }

      const dueMinutesValidation = validateDueMinutes(dueMinutes);

      if (!dueMinutesValidation.ok) {
        throw new Error(dueMinutesValidation.message);
      }

      const dueAt = computeDueAt(new Date(), dueMinutes);

      const { data, error } = await supabase
        .from("kanryo_tasks")
        // jst_date / daily_seq は BEFORE INSERT トリガーが必ず上書きするため送らない。
        // 生成された型はトリガーでの補完を表現できず必須列として要求してくるため、キャストで回避する。
        .insert({ user_id: authorId, body, due_at: dueAt } as TablesInsert<"kanryo_tasks">)
        .select(TASK_SELECT_COLUMNS)
        .single();

      if (error !== null) {
        throw new Error(error.message);
      }

      return toKanryoTaskFromJoinedRow(data as unknown as TaskRowWithProfile);
    },

    async completeTask({ id, authorId }) {
      const { data, error } = await supabase
        .from("kanryo_tasks")
        .update({ status: "completed" })
        .eq("id", id)
        .eq("user_id", authorId)
        .select(TASK_SELECT_COLUMNS)
        .single();

      if (error !== null) {
        // RLS または上の user_id フィルタに一致しなければ0行更新となり、
        // single() が「行が見つからない」エラー(PGRST116)を返す
        throw new Error(
          error.code === "PGRST116" ? "他のユーザーのタスクは完了にできません" : error.message,
        );
      }

      return toKanryoTaskFromJoinedRow(data as unknown as TaskRowWithProfile);
    },

    async likeTask({ taskId, userId }) {
      // 既にいいね済みの場合は複合主キーの一意制約に反するため、ignoreDuplicates で無視する
      // （連打・複数タブでの二重送信を許容する）
      const { error } = await supabase
        .from("kanryo_task_likes")
        .upsert(
          { task_id: taskId, user_id: userId },
          { onConflict: "task_id,user_id", ignoreDuplicates: true },
        );

      if (error !== null) {
        throw new Error(error.message);
      }
    },

    async unlikeTask({ taskId, userId }) {
      const { error } = await supabase
        .from("kanryo_task_likes")
        .delete()
        .eq("task_id", taskId)
        .eq("user_id", userId);

      if (error !== null) {
        throw new Error(error.message);
      }
    },
  };
}

/** Realtime で受け取った投稿・完了を一覧へ反映する。既存IDなら上書き、新規なら先頭に追加する。 */
export function upsertTask(tasks: readonly KanryoTask[], incoming: KanryoTask): KanryoTask[] {
  const exists = tasks.some((task) => task.id === incoming.id);

  if (exists) {
    return tasks.map((task) => (task.id === incoming.id ? incoming : task));
  }

  return [incoming, ...tasks].toSorted(compareByCursorOrder);
}
