import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import type { Profile } from "@/lib/auth/types";

const usePathnameMock = vi.hoisted(() => vi.fn<() => string>());

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

const currentUser: Profile = {
  id: "u1",
  displayName: "たくみ",
  avatarUrl: null,
  memberType: "zero",
};

describe("MobileSidebar", () => {
  it("開いた状態でページ遷移するとドロワーを閉じる", async () => {
    usePathnameMock.mockReturnValue("/");
    const user = userEvent.setup();
    const { rerender } = render(<MobileSidebar currentUser={currentUser} />);

    await user.click(screen.getByRole("button", { name: "メインナビゲーションを開く" }));
    expect(
      screen.getByRole("button", { name: "メインナビゲーションを閉じる" }),
    ).toBeInTheDocument();

    usePathnameMock.mockReturnValue("/timeline");
    rerender(<MobileSidebar currentUser={currentUser} />);

    expect(
      screen.queryByRole("button", { name: "メインナビゲーションを閉じる" }),
    ).not.toBeInTheDocument();
  });

  it("閉じたままページ遷移しても開かない", () => {
    usePathnameMock.mockReturnValue("/");
    const { rerender } = render(<MobileSidebar currentUser={currentUser} />);

    usePathnameMock.mockReturnValue("/timeline");
    rerender(<MobileSidebar currentUser={currentUser} />);

    expect(
      screen.queryByRole("button", { name: "メインナビゲーションを閉じる" }),
    ).not.toBeInTheDocument();
  });
});
