import { cn } from "@/lib/utils";

/**
 * 表示名の頭文字によるアバター。
 * TODO(#12): Discord のアバター画像を profiles から取得できるようになったら画像表示に差し替える。
 */
export function UserAvatar({
  displayName,
  className,
}: {
  displayName: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        className,
      )}
    >
      {[...displayName][0]}
    </span>
  );
}
