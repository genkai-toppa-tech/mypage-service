import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInMemoryPostRepository, type SeedPost } from "@/lib/timeline/repository";
import type { Post, User } from "@/lib/timeline/types";

const users: readonly User[] = [
  { id: "u1", displayName: "いちろう" },
  { id: "u2", displayName: "じろう" },
];

const seedPosts: readonly SeedPost[] = [
  { id: "p1", authorId: "u1", body: "1件目", createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "p2", authorId: "u2", body: "2件目", createdAt: "2026-08-02T00:00:00.000Z" },
  { id: "p3", authorId: "u1", body: "3件目", createdAt: "2026-08-03T00:00:00.000Z" },
  { id: "p4", authorId: "u2", body: "4件目", createdAt: "2026-08-04T00:00:00.000Z" },
  { id: "p5", authorId: "u1", body: "5件目", createdAt: "2026-08-05T00:00:00.000Z" },
];

function createRepository(
  overrides: Parameters<typeof createInMemoryPostRepository>[0] | null = null,
) {
  let sequence = 0;

  return createInMemoryPostRepository({
    users,
    seedPosts,
    generateId: () => `generated-${++sequence}`,
    ...overrides,
  });
}

function idsOf(posts: readonly Post[]): string[] {
  return posts.map((post) => post.id);
}

describe("listPosts", () => {
  it("新着順に返す", async () => {
    const repository = createRepository();

    const page = await repository.listPosts({ limit: 10 });

    expect(idsOf(page.posts)).toEqual(["p5", "p4", "p3", "p2", "p1"]);
    expect(page.nextCursor).toBeNull();
  });

  it("limit で区切り、次ページのカーソルを返す", async () => {
    const repository = createRepository();

    const page = await repository.listPosts({ limit: 2 });

    expect(idsOf(page.posts)).toEqual(["p5", "p4"]);
    expect(page.nextCursor).toEqual({ createdAt: "2026-08-04T00:00:00.000Z", id: "p4" });
  });

  it("カーソル以降を重複なく返し、最終ページではカーソルが null になる", async () => {
    const repository = createRepository();

    const first = await repository.listPosts({ limit: 2 });
    const second = await repository.listPosts({ limit: 2, cursor: first.nextCursor });
    const third = await repository.listPosts({ limit: 2, cursor: second.nextCursor });

    expect(idsOf(second.posts)).toEqual(["p3", "p2"]);
    expect(idsOf(third.posts)).toEqual(["p1"]);
    expect(third.nextCursor).toBeNull();
  });

  it("作成日時が同じ投稿は id の降順で安定して並ぶ", async () => {
    const sameCreatedAt = "2026-08-06T00:00:00.000Z";
    const repository = createRepository({
      users,
      seedPosts: [
        { id: "pa", authorId: "u1", body: "a", createdAt: sameCreatedAt },
        { id: "pc", authorId: "u1", body: "c", createdAt: sameCreatedAt },
        { id: "pb", authorId: "u1", body: "b", createdAt: sameCreatedAt },
      ],
    });

    const first = await repository.listPosts({ limit: 2 });
    const second = await repository.listPosts({ limit: 2, cursor: first.nextCursor });

    expect(idsOf(first.posts)).toEqual(["pc", "pb"]);
    expect(idsOf(second.posts)).toEqual(["pa"]);
  });

  it("読み込み中に新しい投稿が増えても、続きのページで取りこぼしや重複が起きない", async () => {
    const repository = createRepository();

    const first = await repository.listPosts({ limit: 2 });
    await repository.createPost({ authorId: "u1", body: "読み込み中に増えた投稿" });
    const second = await repository.listPosts({ limit: 2, cursor: first.nextCursor });

    expect(idsOf(second.posts)).toEqual(["p3", "p2"]);
  });
});

describe("createPost", () => {
  it("作成した投稿が先頭に来る", async () => {
    const repository = createRepository();

    const created = await repository.createPost({ authorId: "u1", body: "新しい投稿" });
    const page = await repository.listPosts({ limit: 3 });

    expect(created.author).toEqual(users[0]);
    expect(created.updatedAt).toBeNull();
    expect(idsOf(page.posts)[0]).toBe(created.id);
  });

  it("@everyone を含む投稿では通知作成のコールバックを呼ぶ", async () => {
    const onEveryoneMention = vi.fn<(post: Post) => void>();
    const repository = createRepository({ users, seedPosts, onEveryoneMention });

    const created = await repository.createPost({
      authorId: "u1",
      body: "@everyone 作業会を始めます",
    });

    expect(created.mentionsEveryone).toBe(true);
    expect(onEveryoneMention).toHaveBeenCalledWith(created);
  });

  it("@everyone を含まない投稿ではコールバックを呼ばない", async () => {
    const onEveryoneMention = vi.fn<(post: Post) => void>();
    const repository = createRepository({ users, seedPosts, onEveryoneMention });

    const created = await repository.createPost({ authorId: "u1", body: "ひとりごと" });

    expect(created.mentionsEveryone).toBe(false);
    expect(onEveryoneMention).not.toHaveBeenCalled();
  });

  it("空の本文は作成できない", async () => {
    const repository = createRepository();

    await expect(repository.createPost({ authorId: "u1", body: "  " })).rejects.toThrow(
      "本文を入力してください",
    );
  });
});

describe("updatePost", () => {
  it("自分の投稿を更新でき、更新日時が入る", async () => {
    const repository = createRepository();

    const updated = await repository.updatePost({ id: "p1", authorId: "u1", body: "書き直した" });

    expect(updated.body).toBe("書き直した");
    expect(updated.updatedAt).not.toBeNull();
  });

  it("他人の投稿は更新できない", async () => {
    const repository = createRepository();

    await expect(
      repository.updatePost({ id: "p2", authorId: "u1", body: "乗っ取り" }),
    ).rejects.toThrow("他のユーザーの投稿は編集・削除できません");
  });

  it("編集で @everyone を足しても通知は作成しない", async () => {
    const onEveryoneMention = vi.fn<(post: Post) => void>();
    const repository = createRepository({ users, seedPosts, onEveryoneMention });

    await repository.updatePost({ id: "p1", authorId: "u1", body: "@everyone あとから追記" });

    expect(onEveryoneMention).not.toHaveBeenCalled();
  });
});

describe("deletePost", () => {
  let repository: ReturnType<typeof createRepository>;

  beforeEach(() => {
    repository = createRepository();
  });

  it("削除した投稿は一覧に含まれない", async () => {
    await repository.deletePost({ id: "p5", authorId: "u1" });

    const page = await repository.listPosts({ limit: 10 });

    expect(idsOf(page.posts)).toEqual(["p4", "p3", "p2", "p1"]);
  });

  it("他人の投稿は削除できない", async () => {
    await expect(repository.deletePost({ id: "p2", authorId: "u1" })).rejects.toThrow(
      "他のユーザーの投稿は編集・削除できません",
    );
  });

  it("削除済みの投稿は再度削除できない", async () => {
    await repository.deletePost({ id: "p5", authorId: "u1" });

    await expect(repository.deletePost({ id: "p5", authorId: "u1" })).rejects.toThrow(
      "投稿が見つかりません",
    );
  });
});
