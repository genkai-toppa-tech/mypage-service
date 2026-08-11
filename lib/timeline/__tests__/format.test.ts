import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/lib/timeline/format";

const now = new Date("2026-08-11T12:00:00.000Z");

describe("formatRelativeTime", () => {
  it("1分未満は「たった今」と表示する", () => {
    expect(formatRelativeTime("2026-08-11T11:59:30.000Z", now)).toBe("たった今");
  });

  it("1時間未満は分で表示する", () => {
    expect(formatRelativeTime("2026-08-11T11:25:00.000Z", now)).toBe("35分前");
  });

  it("24時間未満は時間で表示する", () => {
    expect(formatRelativeTime("2026-08-11T04:00:00.000Z", now)).toBe("8時間前");
  });

  it("7日未満は日で表示する", () => {
    expect(formatRelativeTime("2026-08-08T12:00:00.000Z", now)).toBe("3日前");
  });

  it("7日以上前は日付で表示する", () => {
    expect(formatRelativeTime("2026-07-01T12:00:00.000Z", now)).toBe("2026/07/01");
  });
});
