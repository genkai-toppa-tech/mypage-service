import { describe, expect, it, vi } from "vitest";

import { createInMemoryKanryoRepository, type SeedKanryoTask } from "@/lib/kanryo/repository";
import type { KanryoTask, KanryoUser } from "@/lib/kanryo/types";

const users: readonly KanryoUser[] = [
  { id: "u1", displayName: "いちろう" },
  { id: "u2", displayName: "じろう" },
];

function idsOf(tasks: readonly KanryoTask[]): string[] {
  return tasks.map((task) => task.id);
}

function createRepository(
  overrides: Parameters<typeof createInMemoryKanryoRepository>[0] | null = null,
) {
  let sequence = 0;

  return createInMemoryKanryoRepository({
    users,
    generateId: () => `generated-${++sequence}`,
    ...overrides,
  });
}

describe("listTasks", () => {
  it("新着順に返す", async () => {
    const seedTasks: readonly SeedKanryoTask[] = [
      {
        id: "t1",
        authorId: "u1",
        body: "1件目",
        createdAt: "2026-08-01T00:00:00.000Z",
        dueAt: "2026-08-01T00:05:00.000Z",
        status: "pending",
      },
      {
        id: "t2",
        authorId: "u1",
        body: "2件目",
        createdAt: "2026-08-02T00:00:00.000Z",
        dueAt: "2026-08-02T00:05:00.000Z",
        status: "pending",
      },
    ];
    const repository = createRepository({ users, seedTasks });

    const tasks = await repository.listTasks();

    expect(idsOf(tasks)).toEqual(["t2", "t1"]);
  });
});

describe("createTask", () => {
  it("当日1件目は daily_seq が 1 になる", async () => {
    const repository = createRepository({
      users,
      now: () => new Date("2026-09-19T01:00:00.000Z"),
    });

    const created = await repository.createTask({
      authorId: "u1",
      body: "水を飲む",
      dueMinutes: 5,
    });

    expect(created.dailySeq).toBe(1);
    expect(created.dueAt).toBe("2026-09-19T01:05:00.000Z");
    expect(created.status).toBe("pending");
    expect(created.completedAt).toBeNull();
  });

  it("同じユーザー・同じ日（JST）の2件目は daily_seq が 2 になる", async () => {
    const repository = createRepository({
      users,
      now: () => new Date("2026-09-19T01:00:00.000Z"),
    });

    await repository.createTask({ authorId: "u1", body: "1件目", dueMinutes: 5 });
    const second = await repository.createTask({ authorId: "u1", body: "2件目", dueMinutes: 5 });

    expect(second.dailySeq).toBe(2);
  });

  it("ユーザーが違えば daily_seq は独立して数える", async () => {
    const repository = createRepository({
      users,
      now: () => new Date("2026-09-19T01:00:00.000Z"),
    });

    await repository.createTask({ authorId: "u1", body: "いちろうの1件目", dueMinutes: 5 });
    const other = await repository.createTask({
      authorId: "u2",
      body: "じろうの1件目",
      dueMinutes: 5,
    });

    expect(other.dailySeq).toBe(1);
  });

  it("日付（JST）が変わると daily_seq がリセットされる", async () => {
    let current = new Date("2026-09-19T14:59:00.000Z"); // JST 9/19 23:59
    const repository = createRepository({ users, now: () => current });

    const beforeMidnight = await repository.createTask({
      authorId: "u1",
      body: "9/19の投稿",
      dueMinutes: 5,
    });

    current = new Date("2026-09-19T15:01:00.000Z"); // JST 9/20 0:01
    const afterMidnight = await repository.createTask({
      authorId: "u1",
      body: "9/20の投稿",
      dueMinutes: 5,
    });

    expect(beforeMidnight.dailySeq).toBe(1);
    expect(afterMidnight.dailySeq).toBe(1);
  });

  it("作成したタスクが一覧の先頭に来る", async () => {
    const repository = createRepository();

    const created = await repository.createTask({
      authorId: "u1",
      body: "新しいタスク",
      dueMinutes: 1,
    });
    const tasks = await repository.listTasks();

    expect(created.author).toEqual(users[0]);
    expect(tasks[0]?.id).toBe(created.id);
  });

  it("空の本文は作成できない", async () => {
    const repository = createRepository();

    await expect(
      repository.createTask({ authorId: "u1", body: "  ", dueMinutes: 5 }),
    ).rejects.toThrow("本文を入力してください");
  });

  it("範囲外の制限時間は作成できない", async () => {
    const repository = createRepository();

    await expect(
      repository.createTask({ authorId: "u1", body: "タスク", dueMinutes: 0 }),
    ).rejects.toThrow("制限時間は1分以上で入力してください");
  });

  it("カスタムの制限時間（プリセット以外）でも作成できる", async () => {
    const repository = createRepository({
      users,
      now: () => new Date("2026-09-19T01:00:00.000Z"),
    });

    const created = await repository.createTask({
      authorId: "u1",
      body: "資料を作る",
      dueMinutes: 45,
    });

    expect(created.dueAt).toBe("2026-09-19T01:45:00.000Z");
  });
});

describe("completeTask", () => {
  const seedTasks: readonly SeedKanryoTask[] = [
    {
      id: "t1",
      authorId: "u1",
      body: "自分のタスク",
      createdAt: "2026-09-19T00:00:00.000Z",
      dueAt: "2026-09-19T00:05:00.000Z",
      status: "pending",
    },
  ];

  it("本人のタスクを完了にでき、完了時刻がサーバー時刻で入る", async () => {
    const repository = createRepository({
      users,
      seedTasks,
      now: () => new Date("2026-09-19T00:03:00.000Z"),
    });

    const completed = await repository.completeTask({ id: "t1", authorId: "u1" });

    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toBe("2026-09-19T00:03:00.000Z");
  });

  it("他人のタスクは完了にできない", async () => {
    const repository = createRepository({ users, seedTasks });

    await expect(repository.completeTask({ id: "t1", authorId: "u2" })).rejects.toThrow(
      "他のユーザーのタスクは完了にできません",
    );
  });

  it("完了済みのタスクを再度完了にはできない", async () => {
    const repository = createRepository({ users, seedTasks });

    await repository.completeTask({ id: "t1", authorId: "u1" });

    await expect(repository.completeTask({ id: "t1", authorId: "u1" })).rejects.toThrow(
      "すでに完了しています",
    );
  });

  it("存在しないタスクはエラーになる", async () => {
    const repository = createRepository({ users, seedTasks });

    await expect(repository.completeTask({ id: "missing", authorId: "u1" })).rejects.toThrow(
      "タスクが見つかりません",
    );
  });
});

describe("generateId のデフォルト", () => {
  it("crypto.randomUUID を使う", async () => {
    const randomUUID = vi.spyOn(crypto, "randomUUID");
    const repository = createInMemoryKanryoRepository({ users });

    await repository.createTask({ authorId: "u1", body: "タスク", dueMinutes: 5 });

    expect(randomUUID).toHaveBeenCalled();
    randomUUID.mockRestore();
  });
});
