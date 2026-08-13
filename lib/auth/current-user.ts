import type { Profile } from "@/lib/auth/types";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export function toProfile(row: Tables<"profiles">): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    memberType: row.member_type,
  };
}

/**
 * ログイン中のユーザーのプロフィールを返す。未ログインなら null。
 *
 * profiles の行は auth.users の INSERT トリガーで作られるため、
 * 通常はログイン済みなら必ず存在する。行が見つからない場合は
 * ログインしていないものとして扱い、ログインページへ誘導する。
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return data === null ? null : toProfile(data);
}
