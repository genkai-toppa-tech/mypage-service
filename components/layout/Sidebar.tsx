import { SignOutButton } from "@/components/auth/SignOutButton";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { UserAvatar } from "@/components/timeline/UserAvatar";
import type { Profile } from "@/lib/auth/types";

const SERVICE_NAME = "限界突破塾";

export function Sidebar({ currentUser }: { currentUser: Profile | null }) {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-60 shrink-0 flex-col border-r md:flex">
      <div className="border-sidebar-border flex h-14 items-center border-b px-5">
        <span className="text-sm font-semibold tracking-wide">{SERVICE_NAME}</span>
      </div>

      <SidebarNav currentUserId={currentUser?.id ?? null} />

      {currentUser !== null && (
        <div className="border-sidebar-border border-t px-3 py-3">
          <div className="flex items-center gap-2 px-3 py-2">
            <UserAvatar
              displayName={currentUser.displayName}
              avatarUrl={currentUser.avatarUrl}
              className="size-8"
            />
            <span className="min-w-0 truncate text-sm font-medium">{currentUser.displayName}</span>
          </div>
          <SignOutButton />
        </div>
      )}
    </aside>
  );
}
