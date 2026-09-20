import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskCard } from "@/components/kanryo/TaskCard";
import type { KanryoTask, KanryoUser } from "@/lib/kanryo/types";

const now = new Date("2026-09-19T00:00:00.000Z");

const baseTask: KanryoTask = {
  id: "t1",
  author: { id: "u1", displayName: "いちろう" },
  body: "水を飲む",
  dueAt: "2026-09-19T00:05:00.000Z",
  status: "pending",
  completedAt: null,
  dailySeq: 1,
  createdAt: "2026-09-19T00:00:00.000Z",
};

function renderCard(
  overrides: {
    task?: KanryoTask;
    currentUserId?: string;
    likes?: readonly KanryoUser[];
    onToggleLike?: (id: string) => Promise<void>;
  } = {},
) {
  const onComplete = vi.fn<(id: string) => Promise<void>>();
  onComplete.mockResolvedValue(undefined);
  const onToggleLike = overrides.onToggleLike ?? vi.fn<(id: string) => Promise<void>>();

  if (overrides.onToggleLike === undefined) {
    (onToggleLike as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  }

  render(
    <TaskCard
      task={overrides.task ?? baseTask}
      currentUserId={overrides.currentUserId ?? "u1"}
      now={now}
      likes={overrides.likes ?? []}
      onComplete={onComplete}
      onToggleLike={onToggleLike}
    />,
  );

  return { onComplete, onToggleLike };
}

describe("TaskCard", () => {
  it("連番付きの本文と投稿者名を表示する", () => {
    renderCard();

    expect(screen.getByText("いちろう")).toBeInTheDocument();
    expect(screen.getByText("1. 水を飲む")).toBeInTheDocument();
  });

  it("進行中は制限時刻と残り時間を表示し、完了ボタンが押せる", () => {
    renderCard();

    // dueAt = 2026-09-19T00:05:00.000Z は日本時間で 09:05
    expect(screen.getByText("09:05(残り: 5:00)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "完了にする" })).toBeInTheDocument();
  });

  it("時間切れは「時間切れ」を表示し、完了ボタンは押せる", () => {
    renderCard({ task: { ...baseTask, dueAt: "2026-09-18T23:00:00.000Z" } });

    expect(screen.getByText("時間切れ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "完了にする" })).toBeInTheDocument();
  });

  it("完了済みは完了時刻を表示し、完了ボタンは表示しない", () => {
    renderCard({
      task: { ...baseTask, status: "completed", completedAt: "2026-09-19T00:00:30.000Z" },
    });

    expect(screen.getByText(/完了/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "完了にする" })).not.toBeInTheDocument();
  });

  it("時間切れの後に完了した場合は遅れ時間を表示する", () => {
    renderCard({
      task: {
        ...baseTask,
        status: "completed",
        completedAt: "2026-09-19T00:08:00.000Z", // due(00:05) から3分遅れ
      },
    });

    expect(screen.getByText("時間切れから3分遅れ")).toBeInTheDocument();
  });

  it("期限内に完了した場合は遅れ時間を表示しない", () => {
    renderCard({
      task: { ...baseTask, status: "completed", completedAt: "2026-09-19T00:00:30.000Z" },
    });

    expect(screen.queryByText(/遅れ/)).not.toBeInTheDocument();
  });

  it("他人のタスクには完了ボタンを表示しない", () => {
    renderCard({ currentUserId: "u2" });

    expect(screen.queryByRole("button", { name: "完了にする" })).not.toBeInTheDocument();
  });

  it("完了ボタンを押すと onComplete を呼ぶ", async () => {
    const user = userEvent.setup();
    const { onComplete } = renderCard();

    await user.click(screen.getByRole("button", { name: "完了にする" }));

    expect(onComplete).toHaveBeenCalledWith("t1");
  });

  it("完了に失敗するとエラーメッセージを表示する", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<(id: string) => Promise<void>>();
    onComplete.mockRejectedValue(new Error("完了にできませんでした"));
    const onToggleLike = vi.fn<(id: string) => Promise<void>>();
    onToggleLike.mockResolvedValue(undefined);

    render(
      <TaskCard
        task={baseTask}
        currentUserId="u1"
        now={now}
        likes={[]}
        onComplete={onComplete}
        onToggleLike={onToggleLike}
      />,
    );

    await user.click(screen.getByRole("button", { name: "完了にする" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("完了にできませんでした");
  });
});

describe("いいね", () => {
  it("いいねしていない場合はボタン名が「いいねする」になる", () => {
    renderCard();

    expect(screen.getByRole("button", { name: "いいねする" })).toBeInTheDocument();
  });

  it("自分がいいね済みの場合はボタン名が「いいねを取り消す」になり、件数を表示する", () => {
    renderCard({ likes: [{ id: "u1", displayName: "いちろう" }] });

    expect(screen.getByRole("button", { name: "いいねを取り消す" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("自分の投稿にも、いいねボタンを押すと onToggleLike を呼ぶ（自己いいねを許可する）", async () => {
    const user = userEvent.setup();
    const { onToggleLike } = renderCard({ currentUserId: "u1" });

    await user.click(screen.getByRole("button", { name: "いいねする" }));

    expect(onToggleLike).toHaveBeenCalledWith("t1");
  });

  it("いいねしたユーザーのアバターをクリックすると一覧が開く", async () => {
    const user = userEvent.setup();
    renderCard({
      likes: [
        { id: "u2", displayName: "じろう" },
        { id: "u3", displayName: "さぶろう" },
      ],
    });

    await user.click(screen.getByRole("button", { name: "いいねしたユーザー2人を見る" }));

    expect(screen.getByRole("dialog", { name: "いいねしたユーザー" })).toBeInTheDocument();
    expect(screen.getByText("じろう")).toBeInTheDocument();
    expect(screen.getByText("さぶろう")).toBeInTheDocument();
  });

  it("いいねの取り消しに失敗するとエラーメッセージを表示する", async () => {
    const user = userEvent.setup();
    const onToggleLike = vi.fn<(id: string) => Promise<void>>();
    onToggleLike.mockRejectedValue(new Error("いいねに失敗しました"));
    renderCard({ likes: [{ id: "u1", displayName: "いちろう" }], onToggleLike });

    await user.click(screen.getByRole("button", { name: "いいねを取り消す" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("いいねに失敗しました");
  });
});
