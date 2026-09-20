import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TaskComposerForm } from "@/components/kanryo/TaskComposerForm";

beforeEach(() => {
  // setInterval 等の実タイマーはそのまま使い、Date だけを固定する
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 19, 9, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

function renderForm(
  overrides: {
    onSubmit?: (input: { body: string; dueMinutes: number }) => Promise<void>;
    onCancel?: () => void;
    onSuccess?: () => void;
  } = {},
) {
  const onSubmit =
    overrides.onSubmit ??
    vi
      .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
      .mockResolvedValue(undefined);

  render(
    <TaskComposerForm
      onSubmit={onSubmit}
      onCancel={overrides.onCancel}
      onSuccess={overrides.onSuccess}
    />,
  );

  return { onSubmit };
}

describe("TaskComposerForm", () => {
  it("+5分がデフォルトで選択されている", () => {
    renderForm();

    expect(screen.getByRole("button", { name: "+5分" })).toHaveAttribute("aria-pressed", "true");
  });

  it("未入力では投稿できず、エラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("本文を入力してください");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("本文と制限時間を入力して投稿できる", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole("button", { name: "+10分" }));
    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onSubmit).toHaveBeenCalledWith({ body: "水を飲む", dueMinutes: 10 });
  });

  it("投稿に成功すると本文をリセットし、onSuccess を呼ぶ", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn<() => void>();
    renderForm({ onSuccess });

    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(screen.getByPlaceholderText("例: 水を飲む")).toHaveValue("");
  });

  it("時刻を指定して投稿できる", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    // 現在時刻 09:00 → 09:45 は45分後
    fireEvent.change(screen.getByLabelText("時刻"), { target: { value: "09:45" } });
    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "資料を作る");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onSubmit).toHaveBeenCalledWith({ body: "資料を作る", dueMinutes: 45 });
  });

  it("既に過ぎた時刻を指定すると、翌日のその時刻として扱う", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    // 現在時刻 09:00 に対して 08:00 は既に過ぎているため、翌日08:00（23時間後）として扱う
    fireEvent.change(screen.getByLabelText("時刻"), { target: { value: "08:00" } });
    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(onSubmit).toHaveBeenCalledWith({ body: "水を飲む", dueMinutes: 23 * 60 });
  });

  it("時刻を空にした場合は投稿できず、エラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    fireEvent.change(screen.getByLabelText("時刻"), { target: { value: "" } });
    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "制限時間は整数の分数で入力してください",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("投稿に失敗した場合は本文を保持し、エラーを表示する", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<(input: { body: string; dueMinutes: number }) => Promise<void>>()
      .mockRejectedValue(new Error("投稿に失敗しました"));
    const onSuccess = vi.fn<() => void>();
    renderForm({ onSubmit, onSuccess });

    await user.type(screen.getByPlaceholderText("例: 水を飲む"), "水を飲む");
    await user.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("投稿に失敗しました");
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("例: 水を飲む")).toHaveValue("水を飲む");
  });

  it("onCancel を渡すとキャンセルボタンを表示し、押下で呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn<() => void>();
    renderForm({ onCancel });

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("onCancel を渡さない場合はキャンセルボタンを表示しない", () => {
    renderForm();

    expect(screen.queryByRole("button", { name: "キャンセル" })).not.toBeInTheDocument();
  });
});
