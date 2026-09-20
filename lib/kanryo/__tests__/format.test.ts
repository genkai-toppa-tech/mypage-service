import { describe, expect, it } from "vitest";

import { formatDueTime, formatOverrun, formatRemaining } from "@/lib/kanryo/format";

const now = new Date("2026-09-19T00:00:00.000Z");

describe("formatDueTime", () => {
  it("日本時間の HH:mm 形式にする", () => {
    expect(formatDueTime("2026-09-19T07:10:00.000Z")).toBe("16:10");
  });

  it("1桁の時・分は0埋めする", () => {
    expect(formatDueTime("2026-09-19T00:05:00.000Z")).toBe("09:05");
  });
});

describe("formatRemaining", () => {
  it("分:秒 の形式にする", () => {
    expect(formatRemaining("2026-09-19T00:03:24.000Z", now)).toBe("3:24");
  });

  it("秒が1桁のときは0埋めする", () => {
    expect(formatRemaining("2026-09-19T00:00:05.000Z", now)).toBe("0:05");
  });

  it("期限切れの場合は 0:00 を返す", () => {
    expect(formatRemaining("2026-09-18T23:55:00.000Z", now)).toBe("0:00");
  });

  it("ちょうど期限の場合も 0:00 を返す", () => {
    expect(formatRemaining(now.toISOString(), now)).toBe("0:00");
  });
});

describe("formatOverrun", () => {
  it("期限内に完了した場合は null を返す", () => {
    expect(formatOverrun("2026-09-19T00:05:00.000Z", "2026-09-19T00:04:00.000Z")).toBeNull();
  });

  it("ちょうど期限で完了した場合も null を返す", () => {
    expect(formatOverrun("2026-09-19T00:05:00.000Z", "2026-09-19T00:05:00.000Z")).toBeNull();
  });

  it("1分未満の遅れは「1分未満」と表示する", () => {
    expect(formatOverrun("2026-09-19T00:05:00.000Z", "2026-09-19T00:05:30.000Z")).toBe("1分未満");
  });

  it("60分未満の遅れは分のみで表示する", () => {
    expect(formatOverrun("2026-09-19T00:05:00.000Z", "2026-09-19T00:08:00.000Z")).toBe("3分");
  });

  it("60分以上の遅れは時間と分で表示する", () => {
    expect(formatOverrun("2026-09-19T00:05:00.000Z", "2026-09-19T01:20:00.000Z")).toBe("1時間15分");
  });
});
