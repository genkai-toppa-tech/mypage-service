/**
 * Supabase の接続情報。
 *
 * Next.js は `process.env.NEXT_PUBLIC_XXX` というリテラルのプロパティアクセスだけを
 * ビルド時に値へ置き換えるため、変数経由での動的アクセスにはしない。
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url === undefined || url === "" || anonKey === undefined || anonKey === "") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。" +
        ".env.example をコピーして .env.local を作成してください。",
    );
  }

  return { url, anonKey };
}
