import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 では middleware がリネームされて proxy になった。
 * ここではセッションの更新と未ログイン時のリダイレクトだけを行い、
 * 実処理は lib/supabase/proxy.ts に置いている。
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 静的アセットと画像最適化のリクエストを除く、すべてのパスに適用する。
     * ログインページ自体を通すかどうかは isPublicPath() 側で判定する。
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
