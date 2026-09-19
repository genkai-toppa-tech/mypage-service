-- Drizzle のスキーマ定義では表現できない、権限・Realtimeの設定を行う。
-- Issue #31（完了の間 投稿への「いいね」機能）

-- 未ログイン（anon）からは一切触れない。
REVOKE ALL ON public.kanryo_task_likes FROM anon;
--> statement-breakpoint

-- ------------------------------------------------------------------
-- Realtime の有効化
-- ------------------------------------------------------------------

-- 購読にも RLS が効くため、SELECT ポリシー（認証済み全員が閲覧可）で許可された行だけが届く。
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanryo_task_likes;
--> statement-breakpoint

COMMENT ON TABLE public.kanryo_task_likes IS '完了の間の投稿への「いいね」。1ユーザー1いいねを複合主キーで保証する。';
