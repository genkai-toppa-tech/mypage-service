/**
 * ログアウトボタン。
 * CSRF を避けるため POST で `/auth/signout` に送る。JavaScript は不要。
 */
export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        ログアウト
      </button>
    </form>
  );
}
