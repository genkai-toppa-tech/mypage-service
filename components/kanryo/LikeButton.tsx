"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { LikedByDialog } from "@/components/kanryo/LikedByDialog";
import { UserAvatar } from "@/components/user/UserAvatar";
import type { KanryoUser } from "@/lib/kanryo/types";
import { cn } from "@/lib/utils";

/** アバタースタックとして表示するいいねユーザーの最大数。 */
const VISIBLE_LIKER_COUNT = 3;

type LikeButtonProps = {
  likes: readonly KanryoUser[];
  likedByMe: boolean;
  onToggle: () => Promise<void>;
};

/** いいねのトグルボタン。件数・いいねしたユーザーのアバタースタックを併せて表示する。 */
export function LikeButton({ likes, likedByMe, onToggle }: LikeButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const visibleLikers = likes.slice(0, VISIBLE_LIKER_COUNT);
  const hiddenLikerCount = likes.length - visibleLikers.length;

  async function handleClick() {
    setIsSubmitting(true);
    setError(null);

    try {
      await onToggle();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "いいねに失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        aria-pressed={likedByMe}
        aria-label={likedByMe ? "いいねを取り消す" : "いいねする"}
        className={cn(
          "flex items-center gap-1 rounded-full px-1 py-1 text-xs font-medium transition-colors disabled:opacity-50",
          likedByMe ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Heart className="size-4" fill={likedByMe ? "currentColor" : "none"} />
        {likes.length > 0 && <span className="tabular-nums">{likes.length}</span>}
      </button>

      {likes.length > 0 && (
        <button
          type="button"
          onClick={() => setIsListOpen(true)}
          className="flex -space-x-1.5"
          aria-label={`いいねしたユーザー${likes.length}人を見る`}
        >
          {visibleLikers.map((liker) => (
            <UserAvatar
              key={liker.id}
              displayName={liker.displayName}
              avatarUrl={liker.avatarUrl}
              className="border-background size-5 border"
            />
          ))}
          {hiddenLikerCount > 0 && (
            <span className="text-muted-foreground bg-muted border-background flex size-5 items-center justify-center rounded-full border text-[10px]">
              +{hiddenLikerCount}
            </span>
          )}
        </button>
      )}

      {error !== null && (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      )}

      <LikedByDialog open={isListOpen} onOpenChange={setIsListOpen} users={likes} />
    </div>
  );
}
