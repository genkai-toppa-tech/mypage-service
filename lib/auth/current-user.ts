import { cache } from "react";

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
 *
 * layout と page の両方から呼ばれるため、React.cache でリクエスト単位に
 * メモ化する。auth.getUser() は Auth サーバーへの検証リクエストを伴い重いので、
 * 同一リクエスト内での重複呼び出しを防ぐ。
 */
export const getCurrentUser = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return data === null ? null : toProfile(data);
});

/**
 * 指定したユーザーのプロフィールを返す。存在しない場合は null。
 * マイページ（/user/[id]）で、本人以外のプロフィールを表示するために使う。
 *
 * generateMetadata と page 本体の両方から呼ばれるため、React.cache で
 * リクエスト単位にメモ化する。
 */
export const getProfileById = cache(async (id: string): Promise<Profile | null> => {
  const supabase = await createClient();

  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();

  return data === null ? null : toProfile(data);
});
