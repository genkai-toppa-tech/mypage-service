"use client";

import { useState } from "react";

import { TaskComposerDialog } from "@/components/kanryo/TaskComposerDialog";

type TaskComposerButtonProps = {
  onSubmit: (input: { body: string; dueMinutes: number }) => Promise<void>;
};

/**
 * 画面右下に固定表示する投稿ボタン（FAB）。押下でフルスクリーンの投稿画面を開く。
 * PCビューでは投稿エリアを常時表示する（TaskComposerPanel）ため、モバイルビューのみで表示する。
 */
export function TaskComposerButton({ onSubmit }: TaskComposerButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="完了の間に投稿する"
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring fixed right-6 bottom-6 flex size-14 items-center justify-center rounded-full text-2xl leading-none shadow-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        +
      </button>

      <TaskComposerDialog open={open} onOpenChange={setOpen} onSubmit={onSubmit} />
    </div>
  );
}
