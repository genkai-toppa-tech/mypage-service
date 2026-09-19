import { toJstDateKey } from "@/lib/kanryo/date";
import { computeDueAt, validateDueMinutes } from "@/lib/kanryo/due-at";
import type { KanryoTask, KanryoUser, TaskStatus } from "@/lib/kanryo/types";
import { validateTaskBody } from "@/lib/kanryo/validation";

/**
 * 完了の間の永続化層。
 * kanryo_tasks テーブルの導入後は、このインターフェースを満たす Supabase 実装に差し替える。
 */
export interface KanryoRepository {
  listTasks(): Promise<KanryoTask[]>;
  createTask(input: { authorId: string; body: string; dueMinutes: number }): Promise<KanryoTask>;
  completeTask(input: { id: string; authorId: string }): Promise<KanryoTask>;
}

/** インメモリ実装の初期データ。createTask と同じ形の入力で、状態を作り込める。 */
export type SeedKanryoTask = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  dueAt: string;
  status: TaskStatus;
  completedAt?: string | null;
};

type StoredTask = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  dueAt: string;
  status: TaskStatus;
  completedAt: string | null;
  dailySeq: number;
};

/** 新着順（createdAt desc, id desc）で並べるための比較関数。 */
function compareTaskOrder(
  a: { createdAt: string; id: string },
  b: { createdAt: string; id: string },
) {
  if (a.createdAt !== b.createdAt) {
    return a.createdAt < b.createdAt ? 1 : -1;
  }

  if (a.id === b.id) {
    return 0;
  }

  return a.id < b.id ? 1 : -1;
}

/** 同一ユーザー・同一日（JST）の既存タスク数から、当日何件目かを求める。 */
function nextDailySeq(tasks: readonly StoredTask[], authorId: string, createdAt: string): number {
  const dateKey = toJstDateKey(createdAt);
  const count = tasks.filter(
    (task) => task.authorId === authorId && toJstDateKey(task.createdAt) === dateKey,
  ).length;

  return count + 1;
}

export function createInMemoryKanryoRepository(options: {
  users: readonly KanryoUser[];
  seedTasks?: readonly SeedKanryoTask[];
  /** タスクIDの採番。テストから固定値を渡せるようにしている。 */
  generateId?: () => string;
  /** 現在時刻。テストから固定値を注入できるようにしている。 */
  now?: () => Date;
}): KanryoRepository {
  const generateId = options.generateId ?? (() => crypto.randomUUID());
  const now = options.now ?? (() => new Date());
  const usersById = new Map(options.users.map((user) => [user.id, user]));

  const seededTasks: StoredTask[] = [];

  for (const seed of options.seedTasks ?? []) {
    seededTasks.push({
      id: seed.id,
      authorId: seed.authorId,
      body: seed.body,
      createdAt: seed.createdAt,
      dueAt: seed.dueAt,
      status: seed.status,
      completedAt: seed.completedAt ?? null,
      dailySeq: nextDailySeq(seededTasks, seed.authorId, seed.createdAt),
    });
  }

  let tasks: StoredTask[] = seededTasks;

  function toTask(stored: StoredTask): KanryoTask {
    const author = usersById.get(stored.authorId);

    if (author === undefined) {
      throw new Error(`投稿者が見つかりません: ${stored.authorId}`);
    }

    return {
      id: stored.id,
      author,
      body: stored.body,
      dueAt: stored.dueAt,
      status: stored.status,
      completedAt: stored.completedAt,
      dailySeq: stored.dailySeq,
      createdAt: stored.createdAt,
    };
  }

  return {
    async listTasks() {
      return tasks.toSorted(compareTaskOrder).map(toTask);
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

      const nowValue = now();
      const createdAt = nowValue.toISOString();
      const stored: StoredTask = {
        id: generateId(),
        authorId,
        body,
        createdAt,
        dueAt: computeDueAt(nowValue, dueMinutes),
        status: "pending",
        completedAt: null,
        dailySeq: nextDailySeq(tasks, authorId, createdAt),
      };
      tasks = [...tasks, stored];

      return toTask(stored);
    },

    async completeTask({ id, authorId }) {
      const stored = tasks.find((task) => task.id === id);

      if (stored === undefined) {
        throw new Error("タスクが見つかりません");
      }

      // RLS で「本人のみ自分のタスクを更新できる」と定めた制約を、モックでも同じ形で再現する
      if (stored.authorId !== authorId) {
        throw new Error("他のユーザーのタスクは完了にできません");
      }

      if (stored.status === "completed") {
        throw new Error("すでに完了しています");
      }

      const completed: StoredTask = {
        ...stored,
        status: "completed",
        completedAt: now().toISOString(),
      };
      tasks = tasks.map((task) => (task.id === id ? completed : task));

      return toTask(completed);
    },
  };
}
