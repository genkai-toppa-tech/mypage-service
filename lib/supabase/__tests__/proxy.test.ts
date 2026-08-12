import { describe, expect, it } from "vitest";

import { isPublicPath } from "@/lib/supabase/proxy";

describe("isPublicPath", () => {
  it("ログインページとその配下は未ログインでも通す", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/login/help")).toBe(true);
  });

  it("OAuth のコールバックとログアウトは未ログインでも通す", () => {
    expect(isPublicPath("/auth/callback")).toBe(true);
    expect(isPublicPath("/auth/signout")).toBe(true);
  });

  it("それ以外のページはログイン必須にする", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/timeline")).toBe(false);
  });

  it("接頭辞が一致するだけの別パスは通さない", () => {
    expect(isPublicPath("/loginx")).toBe(false);
    expect(isPublicPath("/authors")).toBe(false);
  });
});
