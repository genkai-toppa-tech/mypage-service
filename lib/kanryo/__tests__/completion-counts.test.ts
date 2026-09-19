import { describe, expect, it } from "vitest";

import { toCompletionCounts } from "@/lib/kanryo/completion-counts";

describe("toCompletionCounts", () => {
  it("行が存在すればその値を返す", () => {
    expect(toCompletionCounts({ today_count: 3, total_count: 127 })).toEqual({
      today: 3,
      total: 127,
    });
  });

  it("行が無い場合（完了0件）は today/total ともに 0 にする", () => {
    expect(toCompletionCounts(null)).toEqual({ today: 0, total: 0 });
  });

  it("列がnullの場合も0として扱う", () => {
    expect(toCompletionCounts({ today_count: null, total_count: null })).toEqual({
      today: 0,
      total: 0,
    });
  });
});
