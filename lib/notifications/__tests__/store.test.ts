import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createEveryoneNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  resetNotifications,
  subscribeNotifications,
} from "@/lib/notifications/store";

const recipientIds = ["u1", "u2", "u3"];
const createdAt = "2026-08-11T00:00:00.000Z";

beforeEach(() => {
  resetNotifications();
});

describe("createEveryoneNotifications", () => {
  it("投稿者以外の全員に通知を作る", () => {
    createEveryoneNotifications({ postId: "p1", authorId: "u1", recipientIds, createdAt });

    expect(getUnreadCount("u1")).toBe(0);
    expect(getUnreadCount("u2")).toBe(1);
    expect(getUnreadCount("u3")).toBe(1);
  });

  it("同じ投稿に対して二重に通知を作らない", () => {
    createEveryoneNotifications({ postId: "p1", authorId: "u1", recipientIds, createdAt });
    createEveryoneNotifications({ postId: "p1", authorId: "u1", recipientIds, createdAt });

    expect(getUnreadCount("u2")).toBe(1);
  });

  it("別の投稿の通知は積み上がる", () => {
    createEveryoneNotifications({ postId: "p1", authorId: "u1", recipientIds, createdAt });
    createEveryoneNotifications({ postId: "p2", authorId: "u1", recipientIds, createdAt });

    expect(getUnreadCount("u2")).toBe(2);
  });

  it("購読者に変更を通知する", () => {
    const listener = vi.fn<() => void>();
    const unsubscribe = subscribeNotifications(listener);

    createEveryoneNotifications({ postId: "p1", authorId: "u1", recipientIds, createdAt });

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    createEveryoneNotifications({ postId: "p2", authorId: "u1", recipientIds, createdAt });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("markAllNotificationsAsRead", () => {
  it("指定ユーザーの未読だけを既読にする", () => {
    createEveryoneNotifications({ postId: "p1", authorId: "u1", recipientIds, createdAt });

    markAllNotificationsAsRead("u2", "2026-08-11T01:00:00.000Z");

    expect(getUnreadCount("u2")).toBe(0);
    expect(getUnreadCount("u3")).toBe(1);
  });

  it("未読が無いときは購読者に通知しない", () => {
    const listener = vi.fn<() => void>();
    subscribeNotifications(listener);

    markAllNotificationsAsRead("u2", "2026-08-11T01:00:00.000Z");

    expect(listener).not.toHaveBeenCalled();
  });
});
