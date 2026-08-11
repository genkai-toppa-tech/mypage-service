import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "ページが見つかりません | 限界突破塾 マイページ",
};

export default function NotFound() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-16">
        <p className="text-muted-foreground text-sm font-medium tracking-widest">404 NOT FOUND</p>
        <h1 className="text-2xl font-semibold">ページが見つかりません</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          お探しのページは、URLが変更されたか削除された可能性があります。
          入力されたURLに誤りがないかご確認ください。
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-2 inline-flex h-10 items-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          ホームに戻る
        </Link>
      </div>
    </AppShell>
  );
}
