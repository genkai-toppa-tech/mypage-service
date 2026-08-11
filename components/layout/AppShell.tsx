import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";

/**
 * サイドメニュー＋メインエリアの共通シェル。
 * (main) 配下のページと、ルートの not-found ページの両方で使う。
 * not-found はルートレイアウト直下に描画され (main)/layout.tsx を通らないため、
 * シェルをコンポーネントとして切り出して共有している。
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
