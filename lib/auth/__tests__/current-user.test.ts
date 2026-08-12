import { describe, expect, it } from "vitest";

import { toProfile } from "@/lib/auth/current-user";
import type { Tables } from "@/lib/supabase/database.types";

const row: Tables<"profiles"> = {
  id: "11111111-1111-1111-1111-111111111111",
  display_name: "たくみ",
  avatar_url: "https://cdn.discordapp.com/avatars/1/abc.png",
  member_type: "zero",
  created_at: "2026-08-11T00:00:00.000Z",
  updated_at: "2026-08-11T00:00:00.000Z",
};

describe("toProfile", () => {
  it("profiles の行をアプリ側の型に変換する", () => {
    expect(toProfile(row)).toEqual({
      id: "11111111-1111-1111-1111-111111111111",
      displayName: "たくみ",
      avatarUrl: "https://cdn.discordapp.com/avatars/1/abc.png",
      memberType: "zero",
    });
  });

  it("アバター未設定の行では avatarUrl が null になる", () => {
    expect(toProfile({ ...row, avatar_url: null }).avatarUrl).toBeNull();
  });

  it("礎メンバー（壱）の種別を保持する", () => {
    expect(toProfile({ ...row, member_type: "ichi" }).memberType).toBe("ichi");
  });
});
