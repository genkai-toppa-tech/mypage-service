"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
            <li key={item.href}>
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
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
