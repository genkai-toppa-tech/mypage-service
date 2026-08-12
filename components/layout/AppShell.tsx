import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import type { Profile } from "@/lib/auth/types";

/**
 * サイドメニュー＋メインエリアの共通シェル。
 * (main) 配下のページと、ルートの not-found ページの両方で使う。
 * not-found はルートレイアウト直下に描画され (main)/layout.tsx を通らないため、
 * シェルをコンポーネントとして切り出して共有している。
 *
 * currentUser は (main) 配下でのみ渡す。not-found は認証状態に依存させず、
 * 常に同じ内容を返せるようにしている。
 */
export function AppShell({
  children,
  currentUser = null,
}: {
  children: ReactNode;
  currentUser?: Profile | null;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar currentUser={currentUser} />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
