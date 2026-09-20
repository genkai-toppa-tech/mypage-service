"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { NotificationBadge } from "@/components/layout/NotificationBadge";
import { isActiveNavItem, NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Link の子として描画し、そのリンクへの遷移が進行中かどうかを表示する。
 * useLinkStatus は Link の内側でしか使えないため、専用コンポーネントに切り出している。
 */
function NavLinkPendingIndicator() {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <LoaderCircle className="ml-2 inline size-3.5 animate-spin align-[-2px]" aria-hidden="true" />
  );
}

export function SidebarNav({
  currentUserId,
  onNavigate,
}: {
  currentUserId: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="メインナビゲーション" className="flex-1 px-3 py-4">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveNavItem(pathname, item.href);

          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  "transition-[color,background-color,transform] duration-150",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "active:scale-[0.97] active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                  "focus-visible:ring-sidebar-ring focus-visible:outline-none focus-visible:ring-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70",
                  item.showsNotificationBadge === true && "pr-12",
                )}
              >
                {item.label}
                <NavLinkPendingIndicator />
              </Link>
              {/* リンクのアクセシブル名を項目名のままに保つため、バッジは Link の外に置く。
                  クリックはバッジを透過させ、リンク側で受け取る。 */}
              {item.showsNotificationBadge === true && (
                <NotificationBadge
                  userId={currentUserId}
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
