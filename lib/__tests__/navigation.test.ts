import { describe, expect, it } from "vitest";

import { isActiveNavItem } from "@/lib/navigation";

describe("isActiveNavItem", () => {
  it('href が "/" のときはパスの完全一致のみ現在地とみなす', () => {
    expect(isActiveNavItem("/", "/")).toBe(true);
    expect(isActiveNavItem("/timeline", "/")).toBe(false);
  });

  it("配下のパスも現在地とみなす", () => {
    expect(isActiveNavItem("/timeline", "/timeline")).toBe(true);
    expect(isActiveNavItem("/timeline/123", "/timeline")).toBe(true);
  });

  it("前方一致しただけの別パスは現在地とみなさない", () => {
    expect(isActiveNavItem("/timeline-archive", "/timeline")).toBe(false);
  });
});
