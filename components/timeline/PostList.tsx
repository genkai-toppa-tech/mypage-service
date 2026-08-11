"use client";

import { PostCard } from "@/components/timeline/PostCard";
import type { Post } from "@/lib/timeline/types";

type PostListProps = {
  posts: readonly Post[];
  currentUserId: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onUpdate: (input: { id: string; body: string }) => Promise<void>;
  onDelete: (input: { id: string }) => Promise<void>;
};

/** 新着順に並んだ投稿一覧。追加読み込みは keyset カーソルで行う。 */
export function PostList({
  posts,
  currentUserId,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onUpdate,
  onDelete,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-10 text-center text-sm">
        まだ投稿がありません。最初のつぶやきを投稿してみましょう。
      </p>
    );
  }

  return (
    <>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              currentUserId={currentUserId}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="px-4 py-4 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
          >
            {isLoadingMore ? "読み込み中..." : "もっと見る"}
          </button>
        </div>
      )}
    </>
  );
}
