/**
 * アプリ内通知のインメモリストア。
 * @everyone を含む投稿が作成されたとき、投稿者以外の全員に1件ずつ通知を作る
 * （設計上は posts の AFTER INSERT トリガーが担う処理を、モック期間中はここで再現している）。
 *
 * TODO(#12): 認証基盤の導入後、Supabase の notifications テーブルと Realtime 購読に置き換える。
 */

export type Notification = {
  id: string;
  /** 通知の受信者。 */
  userId: string;
  postId: string;
  createdAt: string;
  /** 未読の場合は null。 */
  readAt: string | null;
};

let notifications: Notification[] = [];
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** useSyncExternalStore から購読するための関数。 */
export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getUnreadCount(userId: string): number {
  return notifications.filter(
    (notification) => notification.userId === userId && notification.readAt === null,
  ).length;
}

/**
 * 全員宛メンションの通知を作成する。投稿者自身には通知しない。
 * 同一 (userId, postId) の重複は作らない（DB側の unique 制約に相当）。
 */
export function createEveryoneNotifications(input: {
  postId: string;
  authorId: string;
  recipientIds: readonly string[];
  createdAt: string;
}): void {
  const added = input.recipientIds
    .filter((userId) => userId !== input.authorId)
    .filter(
      (userId) =>
        !notifications.some(
          (notification) => notification.userId === userId && notification.postId === input.postId,
        ),
    )
    .map((userId) => ({
      id: `ntf-${input.postId}-${userId}`,
      userId,
      postId: input.postId,
      createdAt: input.createdAt,
      readAt: null,
    }));

  if (added.length === 0) {
    return;
  }

  notifications = [...notifications, ...added];
  emitChange();
}

/** 指定ユーザーの未読通知をすべて既読にする。タイムラインを開いたときに呼ぶ。 */
export function markAllNotificationsAsRead(userId: string, readAt: string): void {
  if (getUnreadCount(userId) === 0) {
    return;
  }

  notifications = notifications.map((notification) =>
    notification.userId === userId && notification.readAt === null
      ? {
          id: notification.id,
          userId: notification.userId,
          postId: notification.postId,
          createdAt: notification.createdAt,
          readAt,
        }
      : notification,
  );
  emitChange();
}

/** テスト用にストアを初期化する。 */
export function resetNotifications(seed: readonly Notification[] = []): void {
  notifications = [...seed];
  emitChange();
}
