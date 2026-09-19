/**
 * keyset ページネーション用のカーソル比較ロジック。
 * 並び順が (createdAt desc, id desc) の一覧であれば、つぶやき・完了の間など
 * 機能をまたいで共通に使える。
 */
export type Cursor = { createdAt: string; id: string };

/** 新着順（createdAt desc, id desc）で並べるための比較関数。 */
export function compareByCursorOrder(a: Cursor, b: Cursor): number {
  if (a.createdAt !== b.createdAt) {
    return a.createdAt < b.createdAt ? 1 : -1;
  }

  if (a.id === b.id) {
    return 0;
  }

  return a.id < b.id ? 1 : -1;
}

/**
 * カーソルより後ろ（＝より古い側）に並ぶ要素かを判定する。
 * OFFSET と違い、読み込み中に新しい要素が増えても重複・取りこぼしが起きない。
 */
export function isOlderThanCursor(item: Cursor, cursor: Cursor): boolean {
  if (item.createdAt !== cursor.createdAt) {
    return item.createdAt < cursor.createdAt;
  }

  return item.id < cursor.id;
}
