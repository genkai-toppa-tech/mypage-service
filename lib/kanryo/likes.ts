import type { KanryoUser } from "@/lib/kanryo/types";

/**
 * タスクID → いいねしたユーザー一覧。
 * kanryo_tasks の更新（完了操作など）とは独立に管理するため、KanryoTask には持たせない。
 */
export type TaskLikes = Readonly<Record<string, readonly KanryoUser[]>>;

export function isLikedBy(likes: readonly KanryoUser[], userId: string): boolean {
  return likes.some((liker) => liker.id === userId);
}

/** 指定タスクにいいねしたユーザーを追加する。既に追加済みなら何もしない。 */
export function addLike(likes: TaskLikes, taskId: string, user: KanryoUser): TaskLikes {
  const current = likes[taskId] ?? [];

  if (isLikedBy(current, user.id)) {
    return likes;
  }

  return { ...likes, [taskId]: [...current, user] };
}

/** 指定タスクのいいねを取り消す。 */
export function removeLike(likes: TaskLikes, taskId: string, userId: string): TaskLikes {
  const current = likes[taskId];

  if (current === undefined || !isLikedBy(current, userId)) {
    return likes;
  }

  return { ...likes, [taskId]: current.filter((liker) => liker.id !== userId) };
}
