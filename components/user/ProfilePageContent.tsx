import { CompletionSummary } from "@/components/user/CompletionSummary";
import { ProfileHeader } from "@/components/user/ProfileHeader";
import type { Profile } from "@/lib/auth/types";
import type { CompletionCounts } from "@/lib/kanryo/completion-counts";

/**
 * マイページの中身。`/user`（自分）と `/user/[id]`（他ユーザー）の両方で使う共通部分。
 * 他人のページも数値は閲覧できるが操作はできないため、表示のみで構成している。
 */
export function ProfilePageContent({
  profile,
  counts,
}: {
  profile: Profile;
  counts: CompletionCounts;
}) {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <ProfileHeader profile={profile} />
      <CompletionSummary counts={counts} />
    </section>
  );
}
