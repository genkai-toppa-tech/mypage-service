import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/lib/supabase/database.types";

export type CompletionCounts = {
  /** 今日（JST、completed_at基準）の完了数。 */
  today: number;
  /** 全期間の累計完了数。 */
  total: number;
};

/**
 * kanryo_completion_counts ビューの行から表示用の値に変換する。
 * 完了が0件のユーザーは GROUP BY の性質上ビューに行が現れないため、
 * 行が無い場合（null）は 0 として扱う。
 */
export function toCompletionCounts(
  row: Pick<Tables<"kanryo_completion_counts">, "today_count" | "total_count"> | null,
): CompletionCounts {
  return {
    today: row?.today_count ?? 0,
    total: row?.total_count ?? 0,
  };
}

/** 指定したユーザーの完了数（今日／累計）を取得する。 */
export async function getCompletionCounts(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CompletionCounts> {
  const { data } = await supabase
    .from("kanryo_completion_counts")
    .select("today_count, total_count")
    .eq("user_id", userId)
    .maybeSingle();

  return toCompletionCounts(data);
}
