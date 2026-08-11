import type { User } from "@/lib/timeline/types";

/**
 * モックユーザー。認証基盤 (#12) が入るまでの暫定データ。
 * TODO(#12): Supabase Auth と profiles テーブルの実装後、このファイルごと削除する。
 */
export const MOCK_USERS: readonly User[] = [
  { id: "user-takumi", displayName: "たくみ" },
  { id: "user-koshian", displayName: "こしあん" },
  { id: "user-sakura", displayName: "さくら" },
  { id: "user-yuta", displayName: "ゆうた" },
  { id: "user-minami", displayName: "みなみ" },
];

/** ログイン中のユーザーとして扱うモックユーザー。 */
export const MOCK_CURRENT_USER: User = MOCK_USERS[0];
