import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DueAtSelector } from "@/components/kanryo/DueAtSelector";
import type { DueAtSelection } from "@/lib/kanryo/due-at";

beforeEach(() => {
  // setInterval 等の実タイマーはそのまま使い、Date だけを固定する
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 19, 9, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DueAtSelector", () => {
  it("+1分〜+30分の候補ボタンを表示する", () => {
    render(
      <DueAtSelector
        value={{ mode: "preset", minutes: 5 }}
        onChange={vi.fn<(value: DueAtSelection) => void>()}
      />,
    );

    for (const minutes of [1, 5, 10, 15, 20, 30]) {
      expect(screen.getByRole("button", { name: `+${minutes}分` })).toBeInTheDocument();
    }
  });

  it("選択中のプリセットに aria-pressed を付与する", () => {
    render(
      <DueAtSelector
        value={{ mode: "preset", minutes: 5 }}
        onChange={vi.fn<(value: DueAtSelection) => void>()}
      />,
    );

    expect(screen.getByRole("button", { name: "+5分" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "+1分" })).toHaveAttribute("aria-pressed", "false");
  });

  it("プリセットボタンを押すと選択値を通知する", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: DueAtSelection) => void>();
    render(<DueAtSelector value={{ mode: "preset", minutes: 5 }} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "+10分" }));

    expect(onChange).toHaveBeenCalledWith({ mode: "preset", minutes: 10 });
  });

  it("プリセット選択中は、時刻欄に現在時刻＋選択中の分数のプレビューを表示する", () => {
    render(
      <DueAtSelector
        value={{ mode: "preset", minutes: 10 }}
        onChange={vi.fn<(value: DueAtSelection) => void>()}
      />,
    );

    // 現在時刻 09:00 + 10分 = 09:10
    expect(screen.getByLabelText("時刻")).toHaveValue("09:10");
  });

  it("時刻指定の場合は、その時刻をそのまま表示する", () => {
    render(
      <DueAtSelector
        value={{ mode: "custom", time: "15:05" }}
        onChange={vi.fn<(value: DueAtSelection) => void>()}
      />,
    );

    expect(screen.getByLabelText("時刻")).toHaveValue("15:05");
  });

  it("時刻欄を直接編集すると時刻指定に切り替わる", () => {
    const onChange = vi.fn<(value: DueAtSelection) => void>();
    render(<DueAtSelector value={{ mode: "preset", minutes: 5 }} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("時刻"), { target: { value: "15:05" } });

    expect(onChange).toHaveBeenCalledWith({ mode: "custom", time: "15:05" });
  });

  it("微調整ボタンはPCのみ表示するクラスを持つ", () => {
    render(
      <DueAtSelector
        value={{ mode: "preset", minutes: 5 }}
        onChange={vi.fn<(value: DueAtSelection) => void>()}
      />,
    );

    expect(screen.getByRole("button", { name: "1分進める" }).parentElement).toHaveClass(
      "hidden",
      "md:flex",
    );
  });

  it("「1分進める」ボタンを押すと時刻指定に切り替わり、1分進める", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: DueAtSelection) => void>();
    render(<DueAtSelector value={{ mode: "custom", time: "15:05" }} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "1分進める" }));

    expect(onChange).toHaveBeenCalledWith({ mode: "custom", time: "15:06" });
  });

  it("「1分戻す」ボタンを押すと1分戻す", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: DueAtSelection) => void>();
    render(<DueAtSelector value={{ mode: "custom", time: "15:05" }} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "1分戻す" }));

    expect(onChange).toHaveBeenCalledWith({ mode: "custom", time: "15:04" });
  });

  it("プリセット選択中に微調整ボタンを押すと、プレビュー時刻からの時刻指定に切り替わる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: DueAtSelection) => void>();
    render(<DueAtSelector value={{ mode: "preset", minutes: 10 }} onChange={onChange} />);

    // 現在時刻 09:00 + 10分 = 09:10 → +1分で 09:11
    await user.click(screen.getByRole("button", { name: "1分進める" }));

    expect(onChange).toHaveBeenCalledWith({ mode: "custom", time: "09:11" });
  });

  it("23:59 に1分進めると日をまたいで 00:00 になる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: DueAtSelection) => void>();
    render(<DueAtSelector value={{ mode: "custom", time: "23:59" }} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "1分進める" }));

    expect(onChange).toHaveBeenCalledWith({ mode: "custom", time: "00:00" });
  });

  it("00:00 に1分戻すと日をまたいで 23:59 になる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: DueAtSelection) => void>();
    render(<DueAtSelector value={{ mode: "custom", time: "00:00" }} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "1分戻す" }));

    expect(onChange).toHaveBeenCalledWith({ mode: "custom", time: "23:59" });
  });
});
