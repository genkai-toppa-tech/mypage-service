import { describe, expect, it } from "vitest";

import { resolveBaseUrl, resolveNextPath } from "@/lib/auth/redirect";

describe("resolveNextPath", () => {
  it("サイト内のパスはそのまま通す", () => {
    expect(resolveNextPath("/timeline")).toBe("/timeline");
    expect(resolveNextPath("/timeline?tab=all")).toBe("/timeline?tab=all");
  });

  it("指定が無い場合はトップに戻す", () => {
    expect(resolveNextPath(null)).toBe("/");
  });

  it("外部URLは受け付けない", () => {
    expect(resolveNextPath("https://evil.example.com")).toBe("/");
  });

  it("プロトコル相対URLは受け付けない", () => {
    expect(resolveNextPath("//evil.example.com")).toBe("/");
  });

  it("バックスラッシュで別オリジンと解釈されうる形も受け付けない", () => {
    expect(resolveNextPath("/\\evil.example.com")).toBe("/");
  });
});

describe("resolveBaseUrl", () => {
  it("ローカルではリクエストのオリジンを使う", () => {
    expect(
      resolveBaseUrl({
        requestUrl: "http://localhost:3000/auth/callback?code=abc",
        forwardedHost: "localhost:3000",
        isLocal: true,
      }),
    ).toBe("http://localhost:3000");
  });

  it("転送元ホストがある場合はそちらを優先する（Vercel の Preview / 本番）", () => {
    expect(
      resolveBaseUrl({
        requestUrl: "https://internal.vercel.internal/auth/callback?code=abc",
        forwardedHost: "mypage-service-git-feature-12.vercel.app",
        isLocal: false,
      }),
    ).toBe("https://mypage-service-git-feature-12.vercel.app");
  });

  it("転送元ホストが無い場合はリクエストのオリジンにフォールバックする", () => {
    expect(
      resolveBaseUrl({
        requestUrl: "https://mypage.example.com/auth/callback",
        forwardedHost: null,
        isLocal: false,
      }),
    ).toBe("https://mypage.example.com");
  });
});
