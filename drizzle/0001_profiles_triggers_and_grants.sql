-- Drizzle のスキーマ定義では表現できない、トリガー・関数・列レベル権限を定義する。
-- Issue #12（Supabase導入・認証基盤・profilesテーブルの整備）

-- ------------------------------------------------------------------
-- updated_at の自動更新
-- ------------------------------------------------------------------

CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
--> statement-breakpoint

-- ------------------------------------------------------------------
-- 新規ユーザー登録時に profiles を自動作成する
-- ------------------------------------------------------------------

-- Discord から受け取った表示名・アバターを初回ログイン時にだけ取り込む。
-- 2回目以降のログインで上書きしないのは、サービス側で表示名を編集した内容が
-- Discord の値で毎回巻き戻ってしまうため。
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'user_name', ''),
      'メンバー'
    ),
    NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );

  RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--> statement-breakpoint

-- ------------------------------------------------------------------
-- 列レベル権限
-- ------------------------------------------------------------------

-- RLS は行単位でしか制御できず「この列だけ更新不可」を表現できないため、
-- member_type / id / created_at の更新は列レベル権限で禁止する。
REVOKE UPDATE ON public.profiles FROM authenticated;
--> statement-breakpoint

GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;
--> statement-breakpoint

-- 未ログイン（anon）からは一切触れない。
REVOKE ALL ON public.profiles FROM anon;
--> statement-breakpoint

COMMENT ON TABLE public.profiles IS '塾生のプロフィール。auth.users と1対1で対応する。';
--> statement-breakpoint

COMMENT ON COLUMN public.profiles.member_type IS '零（zero）／壱（ichi＝礎メンバー）。本人からは更新できず、運営のみが変更する。';
