"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * Discord でのログインを開始するボタン。
 * Supabase 経由で Discord の認可画面へ遷移し、`/auth/callback` に戻ってくる。
 */
export function DiscordSignInButton({ next }: { next: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setIsSubmitting(true);
    setError(null);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);

      if (next !== "/") {
        callbackUrl.searchParams.set("next", next);
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: callbackUrl.toString() },
      });

      if (signInError !== null) {
        throw signInError;
      }

      // 成功時は Discord の認可画面へ遷移するため、ここで状態を戻す必要はない
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ログインを開始できませんでした。時間をおいて再度お試しください。",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isSubmitting}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Discord に移動しています..." : "Discord でログイン"}
      </button>

      {error !== null && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
