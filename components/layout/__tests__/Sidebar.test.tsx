import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "@/components/layout/Sidebar";
import type { Profile } from "@/lib/auth/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const currentUser: Profile = {
  id: "u1",
  displayName: "たくみ",
  avatarUrl: null,
  memberType: "zero",
};

describe("Sidebar", () => {
  it("ユーザー情報の表示はマイページへのリンクになる", () => {
    render(<Sidebar currentUser={currentUser} />);

    expect(screen.getByRole("link", { name: "たくみのマイページ" })).toHaveAttribute(
      "href",
      "/user",
    );
  });

  it("未ログインの場合はユーザー情報を表示しない", () => {
    render(<Sidebar currentUser={null} />);

    expect(screen.queryByRole("link", { name: /のマイページ/ })).not.toBeInTheDocument();
  });
});
