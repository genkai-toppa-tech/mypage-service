/**
 * サイドメニューの項目定義。
 * 画面を追加したら、ここに1件足すだけでサイドメニューに反映される。
 */
export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [{ label: "ホーム", href: "/" }];

/**
 * 現在のパスが対象の項目を指しているかを判定する。
 * ルート("/")だけは完全一致、それ以外は配下のパスも現在地として扱う。
 */
export function isActiveNavItem(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
