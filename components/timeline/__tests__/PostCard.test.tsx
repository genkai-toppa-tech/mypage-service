import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PostCard } from "@/components/timeline/PostCard";
import type { Post } from "@/lib/timeline/types";

const post: Post = {
  id: "p1",
  author: { id: "u1", displayName: "いちろう" },
  body: "今日の積み上げ",
  mentionsEveryone: false,
  createdAt: new Date().toISOString(),
  updatedAt: null,
};

function renderCard(overrides: { post?: Post; currentUserId?: string } = {}) {
  const onUpdate = vi.fn<(input: { id: string; body: string }) => Promise<void>>();
  const onDelete = vi.fn<(input: { id: string }) => Promise<void>>();

  onUpdate.mockResolvedValue(undefined);
  onDelete.mockResolvedValue(undefined);

  render(
    <PostCard
      post={overrides.post ?? post}
      currentUserId={overrides.currentUserId ?? "u1"}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />,
  );

  return { onUpdate, onDelete };
}

describe("PostCard", () => {
  it("投稿者名・本文・投稿日時を表示する", () => {
    renderCard();

    expect(screen.getByText("いちろう")).toBeInTheDocument();
    expect(screen.getByText("今日の積み上げ")).toBeInTheDocument();
    expect(screen.getByText("たった今")).toBeInTheDocument();
  });

  it("投稿者名・アイコンから投稿者のマイページへ遷移できる", () => {
    renderCard();

    expect(screen.getByRole("link", { name: "いちろう" })).toHaveAttribute("href", "/user/u1");
    expect(screen.getByRole("link", { name: "いちろうのマイページ" })).toHaveAttribute(
      "href",
      "/user/u1",
    );
  });

  it("編集済みの投稿にはその旨を表示する", () => {
    renderCard({ post: { ...post, updatedAt: new Date().toISOString() } });

    expect(screen.getByText("(編集済み)")).toBeInTheDocument();
  });

  it("他人の投稿には編集・削除の操作を表示しない", () => {
    renderCard({ currentUserId: "u2" });

    expect(screen.queryByRole("button", { name: "編集" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
  });

  it("自分の投稿を編集して更新できる", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderCard();

    await user.click(screen.getByRole("button", { name: "編集" }));

    const textarea = screen.getByLabelText("投稿の本文を編集");
    await user.clear(textarea);
    await user.type(textarea, "書き直した本文");
    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(onUpdate).toHaveBeenCalledWith({ id: "p1", body: "書き直した本文" });
  });

  it("編集をキャンセルすると本文の表示に戻る", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderCard();

    await user.click(screen.getByRole("button", { name: "編集" }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.getByText("今日の積み上げ")).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("削除は確認してから実行する", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(screen.getByText("この投稿を削除しますか？")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(onDelete).toHaveBeenCalledWith({ id: "p1" });
  });

  it("削除の確認をキャンセルできる", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });
});
