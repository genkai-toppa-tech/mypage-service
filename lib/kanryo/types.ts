/**
 * 「完了の間」のドメイン型。
 * Issue #18 のDB設計案（kanryo_tasks）と対応させている。
 */

/**
 * 投稿者。profiles テーブルの1行のうち、完了の間の表示に必要な分だけを持つ。
 * `lib/auth/types.ts` の `Profile` はこの形を満たすため、そのまま渡せる。
 */
export type KanryoUser = {
  id: string;
  displayName: string;
  /** Discord のアバター画像URL。未取得・未設定の場合は null。 */
  avatarUrl?: string | null;
};

export type TaskStatus = "pending" | "completed";

/** 完了の間のタスク1件。 */
export type KanryoTask = {
  id: string;
  author: KanryoUser;
  body: string;
  /** ISO8601 形式の文字列。制限時間。 */
  dueAt: string;
  status: TaskStatus;
  /** 未完了の場合は null。 */
  completedAt: string | null;
  /** 当日（JST基準）そのユーザーの何回目の投稿か。 */
  dailySeq: number;
  /** ISO8601 形式の文字列。 */
  createdAt: string;
};
