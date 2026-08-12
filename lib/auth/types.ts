/**
 * 認証まわりのドメイン型。profiles テーブルの1行に対応する。
 */

/** 零／壱（＝礎メンバー）。requirements 機能8。 */
export type MemberType = "zero" | "ichi";

/**
 * ログイン中のユーザーのプロフィール。
 * `lib/timeline/types.ts` の `User` の要件を満たすため、投稿者としてそのまま渡せる。
 */
export type Profile = {
  id: string;
  displayName: string;
  /** Discord のアバター画像URL。未設定の場合は null。 */
  avatarUrl: string | null;
  memberType: MemberType;
};
