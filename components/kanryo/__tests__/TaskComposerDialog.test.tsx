import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskComposerDialog } from "@/components/kanryo/TaskComposerDialog";

function renderDialog(
  overrides: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmit?: (input: { body: string; dueMinutes: number }) => Promise<void>;
  } = {},
) {
  const onOpenChange = overrides.onOpenChange ?? vi.fn<(open: boolean) => void>();
  const onSubmit =
    overrides.onSubmit ??
    vi
      .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
      .mockResolvedValue(undefined);

  render(
    <TaskComposerDialog
      open={overrides.open ?? true}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />,
  );

  return { onOpenChange, onSubmit };
}

describe("TaskComposerDialog", () => {
  it("開いていない場合は本文入力欄を表示しない", () => {
    renderDialog({ open: false });

    expect(screen.queryByPlaceholderText("例: 水を飲む")).not.toBeInTheDocument();
  });

  it("開いている場合は投稿画面を全画面で表示する", () => {
    renderDialog();

    expect(screen.getByText("完了の間に投稿")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例: 水を飲む")).toBeInTheDocument();
  });

  it("キャンセルを押すとスライドアウトのアニメーション後に閉じる", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    // スライドアウトの transition 分は即座には閉じない
    expect(onOpenChange).not.toHaveBeenCalled();

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("投稿に成功するとスライドアウトのアニメーション後に閉じる", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog();

    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("投稿に失敗した場合は閉じずエラーを表示する", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
      .mockRejectedValue(new Error("投稿に失敗しました"));
    const { onOpenChange } = renderDialog({ onSubmit });

    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("投稿に失敗しました");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
