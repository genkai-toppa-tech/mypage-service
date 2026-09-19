"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarContent, SERVICE_NAME } from "@/components/layout/Sidebar";
import type { Profile } from "@/lib/auth/types";

/** 画面左端からのスワイプをドロワー展開とみなす起点の範囲（px） */
const SWIPE_EDGE_ZONE_PX = 32;
/** ドロワーを開くとみなす右方向の最小移動量（px） */
const SWIPE_OPEN_THRESHOLD_PX = 60;
/** モバイル判定の閾値。Tailwind の md ブレークポイント（768px）に合わせる */
const MOBILE_MAX_WIDTH_PX = 767;

/**
 * スマホビュー用のサイドメニュー。
 * 画面左上のハンバーガーボタン、または画面左端からの右スワイプでドロワーを開く。
 * デスクトップ幅では Sidebar（常設）が表示されるため、md 以上では常に非表示にする。
 */
export function MobileSidebar({ currentUser }: { currentUser: Profile | null }) {
  const [open, setOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pathname = usePathname();

  // 別ページへ遷移したら、開きっぱなしにならないようドロワーを閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function isMobileViewport() {
      return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;
    }

    function handleTouchStart(event: TouchEvent) {
      if (open || !isMobileViewport()) {
        touchStart.current = null;
        return;
      }

      const touch = event.touches[0];
      if (touch === undefined || touch.clientX > SWIPE_EDGE_ZONE_PX) {
        touchStart.current = null;
        return;
      }

      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchMove(event: TouchEvent) {
      if (touchStart.current === null) {
        return;
      }

      const touch = event.touches[0];
      if (touch === undefined) {
        return;
      }

      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      if (deltaX >= SWIPE_OPEN_THRESHOLD_PX && deltaX > Math.abs(deltaY)) {
        setOpen(true);
        touchStart.current = null;
      }
    }

    function handleTouchEnd() {
      touchStart.current = null;
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="border-sidebar-border bg-sidebar text-sidebar-foreground fixed top-0 right-0 left-0 z-40 flex h-14 items-center gap-3 border-b px-4 md:hidden">
        <Dialog.Trigger
          aria-label="メインナビゲーションを開く"
          className="focus-visible:ring-ring -ml-1 rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Dialog.Trigger>
        <span className="text-sm font-semibold tracking-wide">{SERVICE_NAME}</span>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 md:hidden" />
        <Dialog.Content className="bg-sidebar text-sidebar-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed top-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col duration-200 md:hidden">
          <Dialog.Title className="sr-only">メインナビゲーション</Dialog.Title>
          <Dialog.Description className="sr-only">
            {SERVICE_NAME}のページ間を移動するメニューです。
          </Dialog.Description>

          <Dialog.Close
            aria-label="メインナビゲーションを閉じる"
            className="focus-visible:ring-ring absolute top-3 right-3 rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>

          <SidebarContent currentUser={currentUser} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
