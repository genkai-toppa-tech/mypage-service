import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DiscordSignInButton } from "@/components/auth/DiscordSignInButton";
import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "ログイン | 限界突破塾 マイページ",
};

/** コールバックから戻ってきたときに表示するエラー文言。 */
const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "ログインが完了しませんでした。もう一度お試しください。",
  exchange_failed: "ログインの検証に失敗しました。もう一度お試しください。",
};

function firstValue(value: string | string[] | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = resolveNextPath(firstValue(params.next));
  const errorMessage = ERROR_MESSAGES[firstValue(params.error) ?? ""] ?? null;

  // ログイン済みのユーザーがログインページに留まらないようにする
  if ((await getCurrentUser()) !== null) {
    redirect(next);
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center p-6">
      <div className="border-border w-full max-w-sm rounded-lg border p-8">
        <p className="text-muted-foreground text-xs font-medium tracking-widest">限界突破塾</p>
        <h1 className="mt-2 text-2xl font-semibold">マイページにログイン</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          塾生限定のサービスです。Discord アカウントでログインしてください。
        </p>

        {errorMessage !== null && (
          <p
            role="alert"
            className="border-destructive/40 text-destructive mt-6 rounded-md border px-3 py-2 text-sm"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-6">
          <DiscordSignInButton next={next} />
        </div>
      </div>
    </main>
  );
}
