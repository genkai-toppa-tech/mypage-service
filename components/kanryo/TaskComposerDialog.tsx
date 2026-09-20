"use client";

import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";

import { TaskComposerForm } from "@/components/kanryo/TaskComposerForm";
import { cn } from "@/lib/utils";

/** スライドイン/アウトの transition と同じ長さ（ms）。閉じる実処理を遅らせるのに使う。 */
const CLOSE_ANIMATION_MS = 300;

type TaskComposerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { body: string; dueMinutes: number }) => Promise<void>;
};

/**
 * 完了の間の投稿画面（モバイル向け）。＋ボタン押下で画面下からスライドインし、
 * 画面全体に表示する。キャンセル・投稿成功時は画面下へスライドアウトしてから閉じる。
 *
 * Radix の Dialog は CSS keyframe アニメーションの終了しか検知できず、
 * transform の transition では閉じるアニメーションを待たずに即座にアンマウントしてしまう。
 * そのため isVisible で見た目のスライド状態を管理し、transition 分だけ実際の
 * onOpenChange(false) を遅らせている。
 */
export function TaskComposerDialog({ open, onOpenChange, onSubmit }: TaskComposerDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setIsVisible(true));

    return () => cancelAnimationFrame(frame);
  }, [open]);

  function requestClose() {
    setIsVisible(false);
    window.setTimeout(() => onOpenChange(false), CLOSE_ANIMATION_MS);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          requestClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0",
          )}
        />
        <Dialog.Content
          className={cn(
            // z-50: スマホ用ヘッダー（MobileSidebar、z-40）ごと画面全体を覆う
            "bg-background fixed inset-0 z-50 flex flex-col transition-transform duration-300 ease-out",
            isVisible ? "translate-y-0" : "translate-y-full",
          )}
        >
          <Dialog.Title className="sr-only">完了の間に投稿</Dialog.Title>
          <Dialog.Description className="sr-only">
            制限時間つきの宣言を投稿します。
          </Dialog.Description>

          <TaskComposerForm
            onSubmit={onSubmit}
            onCancel={requestClose}
            onSuccess={requestClose}
            actionsPlacement="header"
            className="flex-1"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
