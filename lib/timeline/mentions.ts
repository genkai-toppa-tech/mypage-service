/** 全員宛メンションの表記。Discordの記法に合わせ、大文字小文字は区別する。 */
export const EVERYONE_MENTION = "@everyone";

/**
 * 単語境界を要求することで "@everyone2" のような別語を誤検出しない。
 * g フラグは lastIndex を持ち回ってしまうため、都度生成する。
 */
function everyoneMentionPattern(): RegExp {
  return /@everyone\b/g;
}

/** 本文が全員宛メンションを含むかを判定する。 */
export function containsEveryoneMention(body: string): boolean {
  return everyoneMentionPattern().test(body);
}

export type BodySegment = {
  type: "text" | "mention";
  value: string;
  /** 本文中の開始位置。表示側で安定したキーとして使う。 */
  start: number;
};

/**
 * 本文をメンション部分とそれ以外に分割する。
 * 表示側でメンションだけをハイライトするために使う。
 */
export function splitByEveryoneMention(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  const pattern = everyoneMentionPattern();
  let lastIndex = 0;

  for (const match of body.matchAll(pattern)) {
    // matchAll が返す index は g フラグ付きの正規表現では常に存在する
    const index = match.index;

    if (index > lastIndex) {
      segments.push({ type: "text", value: body.slice(lastIndex, index), start: lastIndex });
    }
    segments.push({ type: "mention", value: match[0], start: index });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", value: body.slice(lastIndex), start: lastIndex });
  }

  return segments;
}
