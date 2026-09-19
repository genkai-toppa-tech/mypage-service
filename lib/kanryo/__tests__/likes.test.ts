import { describe, expect, it } from "vitest";

import { addLike, isLikedBy, removeLike, type TaskLikes } from "@/lib/kanryo/likes";
import type { KanryoUser } from "@/lib/kanryo/types";

const alice: KanryoUser = { id: "u1", displayName: "あき", avatarUrl: null };
const bob: KanryoUser = { id: "u2", displayName: "ぼぶ", avatarUrl: null };

describe("isLikedBy", () => {
  it("含まれていればtrueを返す", () => {
    expect(isLikedBy([alice], "u1")).toBe(true);
  });

  it("含まれていなければfalseを返す", () => {
    expect(isLikedBy([alice], "u2")).toBe(false);
  });
});

describe("addLike", () => {
  it("未知のタスクにいいねを追加する", () => {
    const result = addLike({}, "t1", alice);

    expect(result).toEqual({ t1: [alice] });
  });

  it("既存のいいねに追加する", () => {
    const likes: TaskLikes = { t1: [alice] };

    const result = addLike(likes, "t1", bob);

    expect(result).toEqual({ t1: [alice, bob] });
  });

  it("同じユーザーの重複追加は無視する", () => {
    const likes: TaskLikes = { t1: [alice] };

    const result = addLike(likes, "t1", alice);

    expect(result).toBe(likes);
  });

  it("他のタスクのいいねには影響しない", () => {
    const likes: TaskLikes = { t1: [alice] };

    const result = addLike(likes, "t2", bob);

    expect(result).toEqual({ t1: [alice], t2: [bob] });
  });
});

describe("removeLike", () => {
  it("いいねを取り消す", () => {
    const likes: TaskLikes = { t1: [alice, bob] };

    const result = removeLike(likes, "t1", "u1");

    expect(result).toEqual({ t1: [bob] });
  });

  it("いいねしていないユーザーの取り消しは何もしない", () => {
    const likes: TaskLikes = { t1: [alice] };

    const result = removeLike(likes, "t1", "u2");

    expect(result).toBe(likes);
  });

  it("未知のタスクの取り消しは何もしない", () => {
    const likes: TaskLikes = {};

    const result = removeLike(likes, "t1", "u1");

    expect(result).toBe(likes);
  });
});
