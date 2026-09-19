-- Custom SQL migration file, put your code below! --

-- Discord の user_name（例: taki_umi_49054）は一見IDのような文字列で分かりにくいため、
-- Discordの表示名（custom_claims.global_name）を優先して profiles.display_name に採用する。
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
      NULLIF(NEW.raw_user_meta_data -> 'custom_claims' ->> 'global_name', ''),
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

-- 既存の profiles のうち、まだ本人がサービス上で表示名を編集していない
-- （= 現在値がDiscordのuser_name/full_name/nameのいずれかと一致している）行だけ
-- 新しいロジックの値に差し替える。
UPDATE public.profiles p
SET display_name = COALESCE(
  NULLIF(u.raw_user_meta_data -> 'custom_claims' ->> 'global_name', ''),
  NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
  NULLIF(u.raw_user_meta_data ->> 'name', ''),
  NULLIF(u.raw_user_meta_data ->> 'user_name', ''),
  'メンバー'
)
FROM auth.users u
WHERE u.id = p.id
  AND p.display_name IN (
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    u.raw_user_meta_data ->> 'user_name'
  );
