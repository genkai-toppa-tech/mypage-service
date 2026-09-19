"use client";

import Link from "next/link";
import { useState } from "react";

import { PostBody } from "@/components/timeline/PostBody";
import { PostForm } from "@/components/timeline/PostForm";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatRelativeTime } from "@/lib/timeline/format";
import type { Post } from "@/lib/timeline/types";

type PostCardProps = {
  post: Post;
  /** 編集・削除の操作を出すかどうかの判定に使う。 */
  currentUserId: string;
  onUpdate: (input: { id: string; body: string }) => Promise<void>;
  onDelete: (input: { id: string }) => Promise<void>;
};

export function PostCard({ post, currentUserId, onUpdate, onDelete }: PostCardProps) {
  const [mode, setMode] = useState<"view" | "edit" | "confirmDelete">("view");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isOwnPost = post.author.id === currentUserId;

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onDelete({ id: post.id });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "削除に失敗しました");
      setIsDeleting(false);
      setMode("view");
    }
  }

  return (
    <article className="border-border flex gap-3 border-b px-4 py-4">
      <Link href={`/user/${post.author.id}`} aria-label={`${post.author.displayName}のマイページ`}>
        <UserAvatar displayName={post.author.displayName} avatarUrl={post.author.avatarUrl} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link href={`/user/${post.author.id}`} className="text-sm font-semibold hover:underline">
            {post.author.displayName}
          </Link>
          <time dateTime={post.createdAt} className="text-muted-foreground text-xs">
            {formatRelativeTime(post.createdAt, new Date())}
          </time>
          {post.updatedAt !== null && (
            <span className="text-muted-foreground text-xs">(編集済み)</span>
          )}
        </div>

        <div className="mt-1">
          {mode === "edit" ? (
            <PostForm
              label="投稿の本文を編集"
              initialBody={post.body}
              submitLabel="更新する"
              onCancel={() => setMode("view")}
              onSubmit={async (body) => {
                await onUpdate({ id: post.id, body });
                setMode("view");
              }}
            />
          ) : (
            <PostBody body={post.body} />
          )}
        </div>

        {isOwnPost && mode === "view" && (
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setMode("confirmDelete")}
              className="text-muted-foreground hover:text-destructive text-xs underline-offset-4 hover:underline"
            >
              削除
            </button>
          </div>
        )}

        {mode === "confirmDelete" && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-xs">この投稿を削除しますか？</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive text-xs font-medium underline-offset-4 hover:underline disabled:opacity-50"
            >
              削除する
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              disabled={isDeleting}
              className="text-muted-foreground text-xs underline-offset-4 hover:underline disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        )}

        {deleteError !== null && (
          <p role="alert" className="text-destructive mt-2 text-xs">
            {deleteError}
          </p>
        )}
      </div>
    </article>
  );
}
