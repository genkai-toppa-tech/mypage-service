import { describe, expect, it, vi } from "vitest";

import type { Profile } from "@/lib/auth/types";
import type { CompletionCounts } from "@/lib/kanryo/completion-counts";

const getProfileByIdMock = vi.hoisted(() => vi.fn<(id: string) => Promise<Profile | null>>());
const getCompletionCountsMock = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => Promise<CompletionCounts>>(),
);
const createClientMock = vi.hoisted(() => vi.fn<() => Promise<unknown>>());

vi.mock("@/lib/auth/current-user", () => ({
  getProfileById: getProfileByIdMock,
}));

vi.mock("@/lib/kanryo/completion-counts", () => ({
  getCompletionCounts: getCompletionCountsMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

const profile: Profile = {
  id: "11111111-1111-1111-1111-111111111111",
  displayName: "たくみ",
  avatarUrl: null,
  memberType: "zero",
};

describe("UserByIdPage", () => {
  it("存在しないIDでは404を返す", async () => {
    getProfileByIdMock.mockResolvedValue(null);

    const { default: UserByIdPage } = await import("@/app/(main)/user/[id]/page");

    await expect(
      UserByIdPage({ params: Promise.resolve({ id: "missing-id" }) }),
    ).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });

    expect(getCompletionCountsMock).not.toHaveBeenCalled();
  });

  it("存在するIDならプロフィールと完了数を表示する", async () => {
    getProfileByIdMock.mockResolvedValue(profile);
    getCompletionCountsMock.mockResolvedValue({ today: 2, total: 10 });
    createClientMock.mockResolvedValue({});

    const { default: UserByIdPage } = await import("@/app/(main)/user/[id]/page");
    const { render, screen } = await import("@testing-library/react");

    const element = await UserByIdPage({ params: Promise.resolve({ id: profile.id }) });
    render(element);

    expect(screen.getByText("たくみ")).toBeInTheDocument();
    expect(screen.getByText("2件")).toBeInTheDocument();
    expect(screen.getByText("10件")).toBeInTheDocument();
  });
});
