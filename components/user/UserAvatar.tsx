import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * ユーザーのアバター。
 * Discord のアバター画像があればそれを表示し、無ければ表示名の頭文字で代替する。
 */
export function UserAvatar({
  displayName,
  avatarUrl = null,
  className,
}: {
  displayName: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  if (avatarUrl !== null && avatarUrl !== "") {
    return (
      <Image
        src={avatarUrl}
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        className={cn("bg-muted size-10 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

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
