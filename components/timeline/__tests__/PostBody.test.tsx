import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PostBody } from "@/components/timeline/PostBody";

describe("PostBody", () => {
  it("@everyone を専用の要素として強調表示する", () => {
    render(<PostBody body="@everyone 今日の作業会は21時からです" />);

    expect(screen.getByText("@everyone")).toBeInTheDocument();
    expect(screen.getByText(/今日の作業会は21時からです/)).toBeInTheDocument();
  });

  it("@everyone を含まない本文はそのまま表示する", () => {
    render(<PostBody body="今日も積み上げます" />);

    expect(screen.getByText("今日も積み上げます")).toBeInTheDocument();
    expect(screen.queryByText("@everyone")).not.toBeInTheDocument();
  });

  it("改行を含む本文を1つの段落として表示する", () => {
    const { container } = render(<PostBody body={"今日の宣言\n・日報を出す"} />);

    expect(container.textContent).toBe("今日の宣言\n・日報を出す");
  });
});
