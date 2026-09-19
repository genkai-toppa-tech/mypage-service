import { render, screen } from "@testing-library/react";
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

  it("+5分がデフォルトで選択されている", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "+5分" })).toHaveAttribute("aria-pressed", "true");
  });

  it("未入力では投稿できず、エラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("本文を入力してください");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("本文と制限時間を入力して投稿できる", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole("button", { name: "+10分" }));
    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onSubmit).toHaveBeenCalledWith({ body: "水を飲む", dueMinutes: 10 });
  });

  it("投稿に成功するとモーダルを閉じる", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog();

    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("カスタムの制限時間を入力して投稿できる", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.clear(screen.getByLabelText("カスタム"));
    await user.type(screen.getByLabelText("カスタム"), "45");
    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "資料を作る");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onSubmit).toHaveBeenCalledWith({ body: "資料を作る", dueMinutes: 45 });
  });

  it("範囲外のカスタム制限時間では投稿できず、エラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.clear(screen.getByLabelText("カスタム"));
    await user.type(screen.getByLabelText("カスタム"), "0");
    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "制限時間は1分以上で入力してください",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("投稿に失敗した場合はモーダルを閉じずエラーを表示する", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
      .mockRejectedValue(new Error("投稿に失敗しました"));
    const { onOpenChange } = renderDialog({ onSubmit });

    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("投稿に失敗しました");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
