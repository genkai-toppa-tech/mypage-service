"use client";

import { Dialog } from "radix-ui";

import { UserAvatar } from "@/components/user/UserAvatar";
import type { KanryoUser } from "@/lib/kanryo/types";

type LikedByDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: readonly KanryoUser[];
};

/** いいねしたユーザーの一覧モーダル。 */
export function LikedByDialog({ open, onOpenChange, users }: LikedByDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="border-border bg-background fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">いいねしたユーザー</Dialog.Title>
          <Dialog.Description className="sr-only">
            この投稿にいいねしたユーザーの一覧です。
          </Dialog.Description>

          <ul className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-3">
                <UserAvatar
                  displayName={user.displayName}
                  avatarUrl={user.avatarUrl}
                  className="size-8"
                />
                <span className="text-sm">{user.displayName}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground text-sm">
                閉じる
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
