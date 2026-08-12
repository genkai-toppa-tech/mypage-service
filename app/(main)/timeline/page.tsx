import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Timeline } from "@/components/timeline/Timeline";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "タイムライン | 限界突破塾 マイページ",
};

export default async function TimelinePage() {
  const currentUser = await getCurrentUser();

  if (currentUser === null) {
    redirect("/login");
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold">タイムライン</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        日々の積み上げを共有する場所です。全員に知らせたいときは @everyone を付けて投稿します。
      </p>

      {/* 投稿データの Supabase 移行が済むまでの注意書き */}
      <p className="border-border text-muted-foreground mt-4 rounded-md border border-dashed px-3 py-2 text-xs">
        投稿はまだ保存されません。ブラウザを再読み込みすると消えます。
      </p>

      <div className="border-border mt-6 overflow-hidden rounded-lg border">
        <Timeline currentUser={currentUser} />
      </div>
    </section>
  );
}
