-- Issue #22（マイページ 完了数集計表示）
-- 完了の間の完了数を集計するビュー。security_invoker を付けることで、
-- ビューを叩いたユーザーの権限で kanryo_tasks の RLS が評価される
-- （付けないとビュー作成者の権限で実行され、RLS を素通りしてしまう）。

CREATE VIEW public.kanryo_completion_counts
WITH (security_invoker = true) AS
SELECT
  user_id,
  count(*) AS total_count,
  -- 「今日」は完了した日（completed_at）で判定する。jst_date（投稿日）ではない。
  -- 昨日の夜に投稿したタスクを今日の朝に完了した場合も「今日の完了数」に入れるため
  count(*) FILTER (
    WHERE (timezone('Asia/Tokyo', completed_at))::date
        = (timezone('Asia/Tokyo', now()))::date
  ) AS today_count
FROM public.kanryo_tasks
WHERE status = 'completed'
GROUP BY user_id;
--> statement-breakpoint

-- ビューへのSELECTはRLS（kanryo_tasksのSELECTポリシー）が実質的な権限制御を担うため、
-- ビュー自体はauthenticatedに公開する。未ログイン（anon）からは触れない。
GRANT SELECT ON public.kanryo_completion_counts TO authenticated;
--> statement-breakpoint

REVOKE ALL ON public.kanryo_completion_counts FROM anon;
--> statement-breakpoint

COMMENT ON VIEW public.kanryo_completion_counts IS '完了の間の完了数集計（今日/累計）。security_invoker によりRLSが効く。';
