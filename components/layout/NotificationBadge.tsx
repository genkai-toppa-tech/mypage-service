"use client";

import { useSyncExternalStore } from "react";

// TODO(#12): 認証基盤の導入後、モック通知の読み込みを削除する
import "@/lib/mock/notifications";
import { MOCK_CURRENT_USER } from "@/lib/mock/users";
import { getUnreadCount, subscribeNotifications } from "@/lib/notifications/store";
import { cn } from "@/lib/utils";

/**
 * 未読のアプリ内通知の件数バッジ。未読が無いときは何も表示しない。
 * TODO(#12): 認証基盤の導入後、ログイン中のユーザーIDを Supabase Auth から取得する。
 */
export function NotificationBadge({ className }: { className?: string }) {
  const unreadCount = useSyncExternalStore(
    subscribeNotifications,
    () => getUnreadCount(MOCK_CURRENT_USER.id),
    () => getUnreadCount(MOCK_CURRENT_USER.id),
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
