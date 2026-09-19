import { describe, expect, it } from "vitest";

import { toKanryoTask, upsertTask } from "@/lib/kanryo/repository";
import type { KanryoTask, KanryoUser } from "@/lib/kanryo/types";

const author: KanryoUser = { id: "u1", displayName: "いちろう", avatarUrl: null };

describe("toKanryoTask", () => {
  it("DBの行と投稿者情報からアプリ側の型に変換する", () => {
    const task = toKanryoTask(
      {
        id: "t1",
        body: "水を飲む",
        due_at: "2026-09-19T00:05:00.000Z",
        status: "pending",
        completed_at: null,
        daily_seq: 1,
        created_at: "2026-09-19T00:00:00.000Z",
      },
      author,
    );

    expect(task).toEqual({
      id: "t1",
      author,
      body: "水を飲む",
      dueAt: "2026-09-19T00:05:00.000Z",
      status: "pending",
      completedAt: null,
      dailySeq: 1,
      createdAt: "2026-09-19T00:00:00.000Z",
    });
  });
});

describe("upsertTask", () => {
  const existing: KanryoTask = {
    id: "t1",
    author,
    body: "水を飲む",
    dueAt: "2026-09-19T00:05:00.000Z",
    status: "pending",
    completedAt: null,
    dailySeq: 1,
    createdAt: "2026-09-19T00:00:00.000Z",
  };

  it("未知のIDは新着として先頭に追加する", () => {
    const incoming: KanryoTask = {
      ...existing,
      id: "t2",
      createdAt: "2026-09-19T00:10:00.000Z",
    };

    const result = upsertTask([existing], incoming);

    expect(result.map((task) => task.id)).toEqual(["t2", "t1"]);
  });

  it("既知のIDは追加せず、その場で上書きする（完了イベントの反映）", () => {
    const updated: KanryoTask = {
      ...existing,
      status: "completed",
      completedAt: "2026-09-19T00:03:00.000Z",
    };

    const result = upsertTask([existing], updated);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(updated);
  });

  it("新着はcreatedAtの新しい順を保って挿入する", () => {
    const older: KanryoTask = { ...existing, id: "t0", createdAt: "2026-09-18T00:00:00.000Z" };
    const incoming: KanryoTask = {
      ...existing,
      id: "t-mid",
      createdAt: "2026-09-18T12:00:00.000Z",
    };

    const result = upsertTask([existing, older], incoming);

    expect(result.map((task) => task.id)).toEqual(["t1", "t-mid", "t0"]);
  });
});
