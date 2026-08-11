"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import {
  containsEveryoneMention,
  EVERYONE_MENTION,
  splitByEveryoneMention,
} from "@/lib/timeline/mentions";
import {
  countPostBodyLength,
  MAX_POST_BODY_LENGTH,
  validatePostBody,
} from "@/lib/timeline/validation";

type PostFormProps = {
  label: string;
  submitLabel: string;
  initialBody?: string;
  placeholder?: string;
  onSubmit: (body: string) => Promise<void>;
  /** 指定した場合のみキャンセルボタンを表示する（編集時に使う）。 */
  onCancel?: () => void;
};

/** 本文からメンションを取り除き、余分な空白を残さないようにする。 */
function removeEveryoneMention(body: string): string {
  return splitByEveryoneMention(body)
    .filter((segment) => segment.type === "text")
    .map((segment) => segment.value)
    .join("")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** 新規投稿と編集で共用するフォーム。 */
export function PostForm({
  label,
  submitLabel,
  initialBody = "",
  placeholder,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const textareaId = useId();
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const length = countPostBodyLength(body);
  const mentionsEveryone = containsEveryoneMention(body);

  function toggleEveryoneMention() {
    setBody((current) =>
      containsEveryoneMention(current)
        ? removeEveryoneMention(current)
        : `${EVERYONE_MENTION} ${current}`.trimEnd(),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validatePostBody(body);

    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(body);
      setBody(initialBody);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={textareaId} className="sr-only">
        {label}
      </label>
      <textarea
        id={textareaId}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="border-border focus-visible:ring-ring w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleEveryoneMention}
          aria-pressed={mentionsEveryone}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            mentionsEveryone
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {EVERYONE_MENTION}
        </button>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-xs tabular-nums",
              length > MAX_POST_BODY_LENGTH ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {length} / {MAX_POST_BODY_LENGTH}
          </span>

          {onCancel !== undefined && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline disabled:opacity-50"
            >
              キャンセル
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {mentionsEveryone && (
        <p className="text-muted-foreground text-xs">この投稿は全員に通知されます</p>
      )}

      {error !== null && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </form>
  );
}
