import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import NotFound from "@/app/not-found";

vi.mock("next/navigation", () => ({
  usePathname: () => "/存在しないページ",
}));

describe("NotFound", () => {
  it("見つからなかったことを伝える見出しを表示する", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "ページが見つかりません" })).toBeInTheDocument();
  });

  it("ホームに戻る導線を表示する", () => {
    render(<NotFound />);

    expect(screen.getByRole("link", { name: "ホームに戻る" })).toHaveAttribute("href", "/");
  });

  it("サイドメニューを表示する", () => {
    render(<NotFound />);

    expect(screen.getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
  });

  it("サイドメニューのどの項目も現在地として扱わない", () => {
    render(<NotFound />);

    expect(screen.getByRole("link", { name: "ホーム" })).not.toHaveAttribute("aria-current");
  });
});
