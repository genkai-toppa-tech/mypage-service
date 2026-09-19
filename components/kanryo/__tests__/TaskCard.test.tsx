import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskCard } from "@/components/kanryo/TaskCard";
import type { KanryoTask } from "@/lib/kanryo/types";

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

function renderCard(overrides: { task?: KanryoTask; currentUserId?: string } = {}) {
  const onComplete = vi.fn<(id: string) => Promise<void>>();
  onComplete.mockResolvedValue(undefined);

  render(
    <TaskCard
      task={overrides.task ?? baseTask}
      currentUserId={overrides.currentUserId ?? "u1"}
      now={now}
      onComplete={onComplete}
    />,
  );

  return { onComplete };
}

describe("TaskCard", () => {
  it("連番付きの本文と投稿者名を表示する", () => {
    renderCard();

    expect(screen.getByText("いちろう")).toBeInTheDocument();
    expect(screen.getByText("1. 水を飲む")).toBeInTheDocument();
  });

  it("進行中は残り時間を表示し、完了ボタンが押せる", () => {
    renderCard();

    expect(screen.getByText("残り 5:00")).toBeInTheDocument();
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

    render(<TaskCard task={baseTask} currentUserId="u1" now={now} onComplete={onComplete} />);

    await user.click(screen.getByRole("button", { name: "完了にする" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("完了にできませんでした");
  });
});
