import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * サーバーコンポーネント / Server Action / Route Handler から使う Supabase クライアント。
 * リクエストごとに作る（クッキーを閉じ込めるため、モジュールスコープで使い回さない）。
 */
export async function createClient() {
  // cookies() を先に呼ぶ。ビルド時の静的生成では、この呼び出しによって
  // 「動的レンダリングが必要なページ」として扱われる（環境変数の検証より前に置く必要がある）
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // サーバーコンポーネントからはクッキーを書き込めない。
          // セッションの更新は proxy.ts が行うため、ここでは無視してよい。
        }
      },
    },
  });
}
