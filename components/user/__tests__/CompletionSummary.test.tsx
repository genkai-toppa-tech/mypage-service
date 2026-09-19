import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompletionSummary } from "@/components/user/CompletionSummary";

describe("CompletionSummary", () => {
  it("今日・累計の完了数を表示する", () => {
    render(<CompletionSummary counts={{ today: 3, total: 127 }} />);

    expect(screen.getByText("3件")).toBeInTheDocument();
    expect(screen.getByText("127件")).toBeInTheDocument();
  });

  it("0件のときも崩れずに表示する", () => {
    render(<CompletionSummary counts={{ today: 0, total: 0 }} />);

    expect(screen.getAllByText("0件")).toHaveLength(2);
  });
});
