import { NextResponse } from "next/server";

import { resolveBaseUrl, resolveNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Discord OAuth のコールバック。
 * Supabase から返ってきた認可コードをセッションに交換し、元のページへ戻す。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = resolveNextPath(searchParams.get("next"));
  const baseUrl = resolveBaseUrl({
    requestUrl: request.url,
    forwardedHost: request.headers.get("x-forwarded-host"),
    isLocal: process.env.NODE_ENV === "development",
  });

  if (code === null) {
    return NextResponse.redirect(`${baseUrl}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error !== null) {
    return NextResponse.redirect(`${baseUrl}/login?error=exchange_failed`);
  }

  return NextResponse.redirect(`${baseUrl}${next}`);
}
