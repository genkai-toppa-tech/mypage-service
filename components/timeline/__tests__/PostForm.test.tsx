import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PostForm } from "@/components/timeline/PostForm";
import { MAX_POST_BODY_LENGTH } from "@/lib/timeline/validation";

type SubmitHandler = (body: string) => Promise<void>;

function createSubmitHandler() {
  const onSubmit = vi.fn<SubmitHandler>();
  onSubmit.mockResolvedValue(undefined);

  return onSubmit;
}

function renderForm(onSubmit = createSubmitHandler()) {
  render(<PostForm label="つぶやきの本文" submitLabel="投稿する" onSubmit={onSubmit} />);

  return {
    onSubmit,
    textarea: screen.getByLabelText("つぶやきの本文"),
    submitButton: screen.getByRole("button", { name: "投稿する" }),
  };
}

describe("PostForm", () => {
  it("入力した本文で送信し、送信後に入力欄を空にする", async () => {
    const user = userEvent.setup();
    const { onSubmit, textarea, submitButton } = renderForm();

    await user.type(textarea, "今日の積み上げ");
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith("今日の積み上げ");
    expect(textarea).toHaveValue("");
  });

  it("空のまま送信するとエラーを表示し、送信しない", async () => {
    const user = userEvent.setup();
    const { onSubmit, submitButton } = renderForm();

    await user.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("本文を入力してください");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("空白のみの本文は送信しない", async () => {
    const user = userEvent.setup();
    const { onSubmit, textarea, submitButton } = renderForm();

    await user.type(textarea, "   ");
    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("上限を超える本文はエラーを表示し、送信しない", async () => {
    const user = userEvent.setup();
    const { onSubmit, textarea, submitButton } = renderForm();

    fireEvent.change(textarea, { target: { value: "あ".repeat(MAX_POST_BODY_LENGTH + 1) } });
    await user.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(
      `本文は${MAX_POST_BODY_LENGTH}文字以内で入力してください`,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("文字数カウンターを表示する", async () => {
    const user = userEvent.setup();
    const { textarea } = renderForm();

    await user.type(textarea, "あいう");

    expect(screen.getByText(`3 / ${MAX_POST_BODY_LENGTH}`)).toBeInTheDocument();
  });

  it("@everyone ボタンでメンションを付け外しできる", async () => {
    const user = userEvent.setup();
    const { textarea } = renderForm();
    const mentionButton = screen.getByRole("button", { name: "@everyone" });

    await user.type(textarea, "作業会のお知らせ");
    await user.click(mentionButton);

    expect(textarea).toHaveValue("@everyone 作業会のお知らせ");
    expect(mentionButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("この投稿は全員に通知されます")).toBeInTheDocument();

    await user.click(mentionButton);

    expect(textarea).toHaveValue("作業会のお知らせ");
    expect(mentionButton).toHaveAttribute("aria-pressed", "false");
  });

  it("送信に失敗した場合はエラーを表示する", async () => {
    const user = userEvent.setup();
    const failingSubmit = vi.fn<SubmitHandler>();
    failingSubmit.mockRejectedValue(new Error("保存に失敗しました"));
    const { textarea, submitButton } = renderForm(failingSubmit);

    await user.type(textarea, "投稿します");
    await user.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("保存に失敗しました");
    expect(textarea).toHaveValue("投稿します");
  });

  it("キャンセルの指定がある場合のみキャンセルボタンを表示する", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn<() => void>();

    render(
      <PostForm
        label="投稿の本文を編集"
        submitLabel="更新する"
        initialBody="編集前の本文"
        onSubmit={createSubmitHandler()}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText("投稿の本文を編集")).toHaveValue("編集前の本文");

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
