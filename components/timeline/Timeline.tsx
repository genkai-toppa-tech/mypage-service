"use client";

import { useEffect, useState } from "react";

import { PostComposer } from "@/components/timeline/PostComposer";
import { PostList } from "@/components/timeline/PostList";
import type { Profile } from "@/lib/auth/types";
import { markAllNotificationsAsRead } from "@/lib/notifications/store";
import { createInMemoryPostRepository } from "@/lib/timeline/repository";
import type { Post, PostCursor } from "@/lib/timeline/types";

/** 1回の読み込みで取得する件数。 */
const PAGE_SIZE = 6;

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function Timeline({ currentUser }: { currentUser: Profile }) {
  // NOTE: posts テーブルの導入までは、投稿はこのブラウザのメモリ上にしか残らない。
  // 投稿者はログイン中の本人だけなので、既知のユーザーも本人1名でよい。
  const [repository] = useState(() => createInMemoryPostRepository({ users: [currentUser] }));
  const [posts, setPosts] = useState<readonly Post[]>([]);
  const [cursor, setCursor] = useState<PostCursor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    repository
      .listPosts({ limit: PAGE_SIZE })
      .then((page) => {
        if (!isActive) {
          return;
        }

        setPosts(page.posts);
        setCursor(page.nextCursor);
      })
      .catch((caught: unknown) => {
        if (isActive) {
          setError(toMessage(caught, "タイムラインの読み込みに失敗しました"));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    // タイムラインを開いた時点で、自分宛の未読通知をすべて既読にする
    markAllNotificationsAsRead(currentUser.id, new Date().toISOString());

    return () => {
      isActive = false;
    };
  }, [repository, currentUser.id]);

  async function handleCreate(body: string) {
    const created = await repository.createPost({
      authorId: currentUser.id,
      body,
    });

    setPosts((current) => [created, ...current]);
  }

  async function handleUpdate({ id, body }: { id: string; body: string }) {
    const updated = await repository.updatePost({
      id,
      authorId: currentUser.id,
      body,
    });

    setPosts((current) => current.map((post) => (post.id === id ? updated : post)));
  }

  async function handleDelete({ id }: { id: string }) {
    await repository.deletePost({ id, authorId: currentUser.id });

    setPosts((current) => current.filter((post) => post.id !== id));
  }

  async function handleLoadMore() {
    if (cursor === null || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const page = await repository.listPosts({ limit: PAGE_SIZE, cursor });

      setPosts((current) => [...current, ...page.posts]);
      setCursor(page.nextCursor);
    } catch (caught) {
      setError(toMessage(caught, "追加の読み込みに失敗しました"));
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div>
      <PostComposer currentUser={currentUser} onSubmit={handleCreate} />

      {isLoading ? (
        <p className="text-muted-foreground px-4 py-10 text-center text-sm">読み込み中...</p>
      ) : (
        <PostList
          posts={posts}
          currentUserId={currentUser.id}
          hasMore={cursor !== null}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {error !== null && (
        <p role="alert" className="text-destructive px-4 pb-4 text-center text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
