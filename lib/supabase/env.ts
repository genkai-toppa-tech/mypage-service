/**
 * Supabase の接続情報。
 *
 * Next.js は `process.env.NEXT_PUBLIC_XXX` というリテラルのプロパティアクセスだけを
 * ビルド時に値へ置き換えるため、変数経由での動的アクセスにはしない。
 */
export function getSupabaseEnv(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // レガシーの anon key（JWT形式）ではなく publishable key（sb_publishable_...）を使う。
  // anon key は併存して動作するが 2026年末に廃止予定のため、新しい方に寄せている。
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url === undefined || url === "" || publishableKey === undefined || publishableKey === "") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY が設定されていません。" +
        ".env.example をコピーして .env.local を作成してください。",
    );
  }

  return { url, publishableKey };
}
