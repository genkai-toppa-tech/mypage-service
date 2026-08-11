import { describe, expect, it } from "vitest";

import { containsEveryoneMention, splitByEveryoneMention } from "@/lib/timeline/mentions";

describe("containsEveryoneMention", () => {
  it("@everyone を含む本文を検出する", () => {
    expect(containsEveryoneMention("@everyone 作業会のお知らせです")).toBe(true);
    expect(containsEveryoneMention("お知らせです @everyone")).toBe(true);
  });

  it("@everyone を含まない本文は検出しない", () => {
    expect(containsEveryoneMention("今日も積み上げます")).toBe(false);
    expect(containsEveryoneMention("everyone とだけ書く")).toBe(false);
  });

  it("@everyone に続けて別の語が繋がっている場合は検出しない", () => {
    expect(containsEveryoneMention("@everyone2 は別の表記")).toBe(false);
  });

  it("大文字小文字を区別する", () => {
    expect(containsEveryoneMention("@Everyone")).toBe(false);
  });
});

describe("splitByEveryoneMention", () => {
  it("メンションとそれ以外を分割する", () => {
    expect(splitByEveryoneMention("@everyone 集合してください")).toEqual([
      { type: "mention", value: "@everyone", start: 0 },
      { type: "text", value: " 集合してください", start: 9 },
    ]);
  });

  it("本文の途中にあるメンションも分割する", () => {
    expect(splitByEveryoneMention("報告です @everyone よろしく")).toEqual([
      { type: "text", value: "報告です ", start: 0 },
      { type: "mention", value: "@everyone", start: 5 },
      { type: "text", value: " よろしく", start: 14 },
    ]);
  });

  it("複数のメンションをすべて分割する", () => {
    expect(splitByEveryoneMention("@everyone と @everyone")).toEqual([
      { type: "mention", value: "@everyone", start: 0 },
      { type: "text", value: " と ", start: 9 },
      { type: "mention", value: "@everyone", start: 12 },
    ]);
  });

  it("メンションが無い場合はテキスト1件になる", () => {
    expect(splitByEveryoneMention("今日の宣言")).toEqual([
      { type: "text", value: "今日の宣言", start: 0 },
    ]);
  });

  it("空文字の場合は空配列を返す", () => {
    expect(splitByEveryoneMention("")).toEqual([]);
  });
});
