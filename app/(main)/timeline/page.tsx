import type { Metadata } from "next";

import { Timeline } from "@/components/timeline/Timeline";

export const metadata: Metadata = {
  title: "タイムライン | 限界突破塾 マイページ",
};

export default function TimelinePage() {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold">タイムライン</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        日々の積み上げを共有する場所です。全員に知らせたいときは @everyone を付けて投稿します。
      </p>

      {/* TODO(#12): 認証基盤の導入後、モックデータの注意書きを削除する */}
      <p className="border-border text-muted-foreground mt-4 rounded-md border border-dashed px-3 py-2 text-xs">
        現在はモックデータで動作しています。投稿はブラウザを再読み込みすると初期状態に戻ります。
      </p>

      <div className="border-border mt-6 overflow-hidden rounded-lg border">
        <Timeline />
      </div>
    </section>
  );
}
