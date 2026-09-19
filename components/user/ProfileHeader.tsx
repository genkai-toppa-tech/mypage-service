// NOTE: PR #27（Issue #19-21）で components/user/UserAvatar.tsx へ移設予定。
// そちらが先にマージされた場合は、このimportパスもあわせて更新が必要。
import { UserAvatar } from "@/components/timeline/UserAvatar";
import type { Profile } from "@/lib/auth/types";

/** マイページ上部のプロフィール表示（アバター・表示名）。 */
export function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-4">
      <UserAvatar
        displayName={profile.displayName}
        avatarUrl={profile.avatarUrl}
        className="size-16 text-xl"
      />
      <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
    </div>
  );
}
