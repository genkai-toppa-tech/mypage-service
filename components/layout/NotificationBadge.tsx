"use client";

import { useSyncExternalStore } from "react";

import { getUnreadCount, subscribeNotifications } from "@/lib/notifications/store";
import { cn } from "@/lib/utils";

/**
 * 未読のアプリ内通知の件数バッジ。未読が無いときは何も表示しない。
 *
 * NOTE: 通知ストアはまだインメモリで、@everyone 投稿の通知は posts テーブルの
 * 導入後に作られるようになる（投稿データの Supabase 移行Issue）。
 * それまでは件数が 0 のままで、バッジは表示されない。
 */
export function NotificationBadge({
  userId,
  className,
}: {
  userId: string | null;
  className?: string;
}) {
  const unreadCount = useSyncExternalStore(
    subscribeNotifications,
    () => (userId === null ? 0 : getUnreadCount(userId)),
    () => 0,
  );

  if (unreadCount === 0) {
    return null;
  }

  return (
    <output
      aria-label={`未読の通知${unreadCount}件`}
      className={cn(
        "bg-primary text-primary-foreground flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        className,
      )}
    >
      {unreadCount}
    </output>
  );
}
