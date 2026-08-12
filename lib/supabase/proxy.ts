import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** ログインページ本体と、OAuth のコールバック・ログアウト。 */
const PUBLIC_PATHS = ["/login", "/auth"] as const;

/**
 * ログインなしで到達できるパスか。
 * 塾生限定のサービスなので、ここに挙げたもの以外はすべてログイン必須にする。
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** ログイン後に元のページへ戻すためのリダイレクト先URLを組み立てる。 */
export function buildLoginUrl(request: NextRequest): URL {
  const loginUrl = new URL("/login", request.url);
  const from = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  // ルートに戻すだけで済む場合はクエリを付けない
  if (from !== "/") {
    loginUrl.searchParams.set("next", from);
  }

  return loginUrl;
}

/**
 * セッションクッキーを更新しつつ、未ログインならログインページへ送る。
 *
 * `@supabase/ssr` の作法どおり、クッキーを書き戻したレスポンスをそのまま返す。
 * 別の NextResponse を作って返すとセッションが更新されず、ログインが不安定になる。
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, anonKey } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getSession() ではなく getUser() を使う。
  // getUser() は Auth サーバーでトークンを検証するため、クッキーの偽装を検出できる。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(buildLoginUrl(request));
  }

  return response;
}
