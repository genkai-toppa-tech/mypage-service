/** ログイン後の遷移先。next が指定されていない・不正な場合はここに戻す。 */
export const DEFAULT_REDIRECT_PATH = "/";

/**
 * `?next=` で受け取った遷移先を、同一オリジン内のパスに限って許可する。
 *
 * 外部URLや `//evil.example.com` のようなプロトコル相対URLをそのまま渡すと
 * オープンリダイレクトになるため、自サイト内のパス以外は既定値に丸める。
 */
export function resolveNextPath(next: string | null): string {
  if (next === null || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_REDIRECT_PATH;
  }

  // `/\evil.example.com` のようにブラウザが別オリジンと解釈しうる形も弾く
  if (next.startsWith("/\\")) {
    return DEFAULT_REDIRECT_PATH;
  }

  return next;
}

/**
 * リダイレクト先の組み立てに使うオリジンを決める。
 *
 * Vercel ではロードバランサ越しにリクエストが届くため、`request.url` のホストが
 * 実際のアクセス先と一致しない。ローカル以外では転送元のホストを優先する。
 */
export function resolveBaseUrl(input: {
  requestUrl: string;
  forwardedHost: string | null;
  isLocal: boolean;
}): string {
  const { origin } = new URL(input.requestUrl);

  if (input.isLocal || input.forwardedHost === null || input.forwardedHost === "") {
    return origin;
  }

  return `https://${input.forwardedHost}`;
}
