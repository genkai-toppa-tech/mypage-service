import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DueAtSelector } from "@/components/kanryo/DueAtSelector";

describe("DueAtSelector", () => {
  it("+1分〜+30分の候補ボタンを表示する", () => {
    render(<DueAtSelector value={5} onChange={vi.fn<(minutes: number) => void>()} />);

    for (const minutes of [1, 5, 10, 15, 20, 30]) {
      expect(screen.getByRole("button", { name: `+${minutes}分` })).toBeInTheDocument();
    }
  });

  it("現在の値に aria-pressed を付与する", () => {
    render(<DueAtSelector value={5} onChange={vi.fn<(minutes: number) => void>()} />);

    expect(screen.getByRole("button", { name: "+5分" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "+1分" })).toHaveAttribute("aria-pressed", "false");
  });

  it("ボタンを押すと選択値を通知する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(minutes: number) => void>();
    render(<DueAtSelector value={5} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "+10分" }));

    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("カスタム入力欄に現在の値が表示される", () => {
    render(<DueAtSelector value={45} onChange={vi.fn<(minutes: number) => void>()} />);

    expect(screen.getByLabelText("カスタム")).toHaveValue(45);
  });

  it("カスタム入力欄に値を入れると通知する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(minutes: number) => void>();
    render(<DueAtSelector value={5} onChange={onChange} />);

    await user.clear(screen.getByLabelText("カスタム"));
    await user.type(screen.getByLabelText("カスタム"), "45");

    expect(onChange).toHaveBeenCalledWith(45);
  });
});
