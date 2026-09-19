-- Drizzle のスキーマ定義では表現できない、トリガー・関数・列レベル権限を定義する。
-- Issue #18（完了の間 DBスキーマ設計）

-- ------------------------------------------------------------------
-- 当日の連番（daily_seq）の採番
-- ------------------------------------------------------------------

-- 日付境界は JST。timezone(text, timestamptz) は IMMUTABLE なので日付をまたいでもぶれない。
-- 同一ユーザー・同一日の同時挿入で番号が衝突しないよう、採番を直列化する
-- （advisory lock の対象はユーザー×日付に絞っているため、他ユーザーの投稿は待たされない）。
CREATE FUNCTION public.set_kanryo_task_daily_seq()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.jst_date := (timezone('Asia/Tokyo', NEW.created_at))::date;

  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text || NEW.jst_date::text));

  SELECT COALESCE(MAX(daily_seq), 0) + 1
    INTO NEW.daily_seq
    FROM public.kanryo_tasks
   WHERE user_id = NEW.user_id
     AND jst_date = NEW.jst_date;

  RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER kanryo_tasks_set_daily_seq
  BEFORE INSERT ON public.kanryo_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_kanryo_task_daily_seq();
--> statement-breakpoint

-- ------------------------------------------------------------------
-- 完了の確定・取り消しの禁止
-- ------------------------------------------------------------------

-- 完了時刻はサーバー時刻で確定させ、端末の時計を信用しない。
-- 完了→未完了への取り消しは今回スコープ外のため、DB側で拒否する。
CREATE FUNCTION public.guard_kanryo_task_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    RAISE EXCEPTION '完了したタスクは未完了に戻せません';
  END IF;

  IF NEW.status = 'completed' AND NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;

  RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER kanryo_tasks_guard_completion
  BEFORE UPDATE ON public.kanryo_tasks
  FOR EACH ROW EXECUTE FUNCTION public.guard_kanryo_task_completion();
--> statement-breakpoint

-- ------------------------------------------------------------------
-- updated_at の自動更新（0001 で定義した set_updated_at() を再利用）
-- ------------------------------------------------------------------

CREATE TRIGGER kanryo_tasks_set_updated_at
  BEFORE UPDATE ON public.kanryo_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
--> statement-breakpoint

-- ------------------------------------------------------------------
-- 列レベル権限
-- ------------------------------------------------------------------

-- RLS は行単位でしか制御できず「この列だけ更新不可」を表現できないため、
-- body / due_at / daily_seq などの改竄（宣言の後出し変更）を列レベル権限で防ぐ。
-- 完了操作としてクライアントから更新できるのは status のみにする。
REVOKE UPDATE ON public.kanryo_tasks FROM authenticated;
--> statement-breakpoint

GRANT UPDATE (status) ON public.kanryo_tasks TO authenticated;
--> statement-breakpoint

-- 未ログイン（anon）からは一切触れない。
REVOKE ALL ON public.kanryo_tasks FROM anon;
--> statement-breakpoint

-- ------------------------------------------------------------------
-- Realtime の有効化
-- ------------------------------------------------------------------

-- 購読にも RLS が効くため、SELECT ポリシー（認証済み全員が閲覧可）で許可された行だけが届く。
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanryo_tasks;
--> statement-breakpoint

COMMENT ON TABLE public.kanryo_tasks IS '完了の間のタスク。制限時間つきの宣言と完了状態を保持する。';
--> statement-breakpoint

COMMENT ON COLUMN public.kanryo_tasks.daily_seq IS '当日（JST基準）そのユーザーの何回目の投稿か。採番は投稿時に確定し、以降変わらない。';
