/**
 * JST（Asia/Tokyo）基準の日付キー（YYYY-MM-DD）を返す。
 * 連番（daily_seq）の日付境界の判定に使う。ブラウザのタイムゾーン設定には依存しない。
 */
export function toJstDateKey(isoDate: string): string {
  // "sv-SE" ロケールは YYYY-MM-DD 形式で返すため、そのままキーとして使える
  return new Date(isoDate).toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}
