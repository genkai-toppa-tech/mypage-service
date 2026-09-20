import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskComposerPanel } from "@/components/kanryo/TaskComposerPanel";

describe("TaskComposerPanel", () => {
  it("ダイアログを使わず常に投稿フォームを表示する", () => {
    render(
      <TaskComposerPanel
        onSubmit={vi
          .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
          .mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByPlaceholderText("例: 水を飲む")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "キャンセル" })).not.toBeInTheDocument();
  });

  it("投稿すると onSubmit が呼ばれ、本文がリセットされる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
      .mockResolvedValue(undefined);
    render(<TaskComposerPanel onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onSubmit).toHaveBeenCalledWith({ body: "水を飲む", dueMinutes: 5 });
    expect(screen.getByPlaceholderText("例: 水を飲む")).toHaveValue("");
  });

  it("スマホビューでは非表示、PCビューでは表示するクラスを持つ", () => {
    const { container } = render(
      <TaskComposerPanel
        onSubmit={vi
          .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
          .mockResolvedValue(undefined)}
      />,
    );

    expect(container.firstElementChild).toHaveClass("hidden", "md:block");
  });
});
