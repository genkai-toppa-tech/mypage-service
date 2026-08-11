/**
 * つぶやきタイムラインのドメイン型。
 * DB設計（Issue #1 の設計案）と対応させている。
 */

/** 投稿者。認証基盤の導入後は profiles テーブルの1行に対応する。 */
export type User = {
  id: string;
  displayName: string;
};

/** つぶやき1件。論理削除済みの投稿は取得結果に含めないため deletedAt は持たせない。 */
export type Post = {
  id: string;
  author: User;
  body: string;
  /** 本文に @everyone を含むか。投稿時にサーバ側で判定した結果を保持する。 */
  mentionsEveryone: boolean;
  /** ISO8601 形式の文字列。 */
  createdAt: string;
  /** 未編集の場合は null。 */
  updatedAt: string | null;
};

/**
 * keyset ページネーション用のカーソル。
 * 並び順が (createdAt desc, id desc) のため、両方を保持する。
 */
export type PostCursor = {
  createdAt: string;
  id: string;
};

export type PostPage = {
  posts: Post[];
  /** 次ページが存在しない場合は null。 */
  nextCursor: PostCursor | null;
};
