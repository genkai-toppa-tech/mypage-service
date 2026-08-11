import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SidebarNav } from "@/components/layout/SidebarNav";
import { NAV_ITEMS } from "@/lib/navigation";

const usePathnameMock = vi.hoisted(() => vi.fn<() => string>());

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

describe("SidebarNav", () => {
  it("NAV_ITEMS の項目をすべてリンクとして表示する", () => {
    usePathnameMock.mockReturnValue("/");

    render(<SidebarNav />);

    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }
  });

  it('現在地のリンクに aria-current="page" を付与する', () => {
    usePathnameMock.mockReturnValue("/");

    render(<SidebarNav />);

    expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute("aria-current", "page");
  });

  it("現在地でないリンクには aria-current を付与しない", () => {
    usePathnameMock.mockReturnValue("/timeline");

    render(<SidebarNav />);

    expect(screen.getByRole("link", { name: "ホーム" })).not.toHaveAttribute("aria-current");
  });
});
