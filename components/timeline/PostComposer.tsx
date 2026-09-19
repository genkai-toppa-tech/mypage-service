"use client";

import { PostForm } from "@/components/timeline/PostForm";
import { UserAvatar } from "@/components/user/UserAvatar";
import type { User } from "@/lib/timeline/types";

type PostComposerProps = {
  currentUser: User;
  onSubmit: (body: string) => Promise<void>;
};

/** タイムライン上部の新規投稿フォーム。 */
export function PostComposer({ currentUser, onSubmit }: PostComposerProps) {
  return (
    <div className="border-border flex gap-3 border-b px-4 py-4">
      <UserAvatar displayName={currentUser.displayName} avatarUrl={currentUser.avatarUrl} />
      <div className="min-w-0 flex-1">
        <PostForm
          label="つぶやきの本文"
          submitLabel="投稿する"
          placeholder="いま積み上げていることを共有しましょう"
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
