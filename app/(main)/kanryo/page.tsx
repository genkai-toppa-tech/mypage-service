import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { KanryoTimeline } from "@/components/kanryo/KanryoTimeline";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseKanryoRepository } from "@/lib/kanryo/repository";
import { createClient } from "@/lib/supabase/server";

/** 1回の読み込みで取得する件数。 */
const PAGE_SIZE = 20;

export const metadata: Metadata = {
  title: "完了の間 | 限界突破塾 マイページ",
};

export default async function KanryoPage() {
  const currentUser = await getCurrentUser();

  if (currentUser === null) {
    redirect("/login");
  }

  const supabase = await createClient();
  const repository = createSupabaseKanryoRepository(supabase);
  const initialPage = await repository.listTasks({ limit: PAGE_SIZE });

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold">完了の間</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        制限時間つきの宣言を投稿し、終わったら完了にチェックしましょう。
      </p>

      <div className="border-border mt-6 overflow-hidden rounded-lg border">
        <KanryoTimeline
          currentUser={currentUser}
          initialTasks={initialPage.tasks}
          initialCursor={initialPage.nextCursor}
          initialLikes={initialPage.likes}
        />
      </div>
    </section>
  );
}
