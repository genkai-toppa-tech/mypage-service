import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { KanryoTimeline } from "@/components/kanryo/KanryoTimeline";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "完了の間 | 限界突破塾 マイページ",
};

export default async function KanryoPage() {
  const currentUser = await getCurrentUser();

  if (currentUser === null) {
    redirect("/login");
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold">完了の間</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        制限時間つきの宣言を投稿し、終わったら完了にチェックしましょう。
      </p>

      {/* kanryo_tasks テーブルの導入までの注意書き */}
      <p className="border-border text-muted-foreground mt-4 rounded-md border border-dashed px-3 py-2 text-xs">
        動作確認用のサンプルユーザーの投稿を含みます。投稿はまだ保存されず、ブラウザを再読み込みすると消えます。
      </p>

      <div className="border-border mt-6 overflow-hidden rounded-lg border">
        <KanryoTimeline currentUser={currentUser} />
      </div>
    </section>
  );
}
