import { NextResponse } from "next/server";

import { resolveBaseUrl } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * ログアウト。
 * リンク（GET）にすると外部サイトから勝手にログアウトさせられるため POST で受ける。
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  await supabase.auth.signOut();

  const baseUrl = resolveBaseUrl({
    requestUrl: request.url,
    forwardedHost: request.headers.get("x-forwarded-host"),
    isLocal: process.env.NODE_ENV === "development",
  });

  // POST を受けて別ページを表示させるので、GET でのリダイレクトになる 303 を返す
  return NextResponse.redirect(`${baseUrl}/login`, { status: 303 });
}
