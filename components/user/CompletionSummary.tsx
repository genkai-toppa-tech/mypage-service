import type { CompletionCounts } from "@/lib/kanryo/completion-counts";

/** 完了の間の積み上げ（今日／累計の完了数）を表示するセクション。 */
export function CompletionSummary({ counts }: { counts: CompletionCounts }) {
  return (
    <section className="border-border mt-6 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">完了の間の積み上げ</h2>

      <dl className="mt-3 flex gap-8">
        <div>
          <dt className="text-muted-foreground text-xs">今日</dt>
          <dd className="text-2xl font-semibold tabular-nums">{counts.today}件</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">これまで</dt>
          <dd className="text-2xl font-semibold tabular-nums">{counts.total}件</dd>
        </div>
      </dl>
    </section>
  );
}
