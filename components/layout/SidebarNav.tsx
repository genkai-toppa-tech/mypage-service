"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NotificationBadge } from "@/components/layout/NotificationBadge";
import { isActiveNavItem, NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav() {
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
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus-visible:ring-sidebar-ring focus-visible:outline-none focus-visible:ring-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70",
                  item.showsNotificationBadge === true && "pr-12",
                )}
              >
                {item.label}
              </Link>
              {/* リンクのアクセシブル名を項目名のままに保つため、バッジは Link の外に置く。
                  クリックはバッジを透過させ、リンク側で受け取る。 */}
              {item.showsNotificationBadge === true && (
                <NotificationBadge className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
