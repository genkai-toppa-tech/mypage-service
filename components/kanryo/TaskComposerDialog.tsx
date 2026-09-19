"use client";

import { useId, useState } from "react";
import { Dialog } from "radix-ui";

import { DueAtSelector } from "@/components/kanryo/DueAtSelector";
import { DEFAULT_DUE_AT_MINUTES, validateDueMinutes } from "@/lib/kanryo/due-at";
import {
  countTaskBodyLength,
  MAX_TASK_BODY_LENGTH,
  validateTaskBody,
} from "@/lib/kanryo/validation";
import { cn } from "@/lib/utils";

type TaskComposerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { body: string; dueMinutes: number }) => Promise<void>;
};

/** 完了の間の投稿モーダル。本文入力・制限時間の選択・投稿を行う。 */
export function TaskComposerDialog({ open, onOpenChange, onSubmit }: TaskComposerDialogProps) {
  const textareaId = useId();
  const [body, setBody] = useState("");
  const [dueMinutes, setDueMinutes] = useState(DEFAULT_DUE_AT_MINUTES);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const length = countTaskBodyLength(body);

  function resetAndClose() {
    setBody("");
    setDueMinutes(DEFAULT_DUE_AT_MINUTES);
    setError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bodyValidation = validateTaskBody(body);

    if (!bodyValidation.ok) {
      setError(bodyValidation.message);
      return;
    }

    const dueMinutesValidation = validateDueMinutes(dueMinutes);

    if (!dueMinutesValidation.ok) {
      setError(dueMinutesValidation.message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ body, dueMinutes });
      resetAndClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) {
          onOpenChange(next);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="border-border bg-background fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">完了の間に投稿</Dialog.Title>
          <Dialog.Description className="text-muted-foreground mt-1 text-sm">
            制限時間つきの宣言を投稿します。
          </Dialog.Description>

          <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
            <label htmlFor={textareaId} className="sr-only">
              完了の間の本文
            </label>
            <textarea
              id={textareaId}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="例: 水を飲む"
              rows={2}
              className="border-border focus-visible:ring-ring w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />

            <DueAtSelector value={dueMinutes} onChange={setDueMinutes} />

            <div className="flex justify-end">
              <span
                className={cn(
                  "text-xs tabular-nums",
                  length > MAX_TASK_BODY_LENGTH ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {length} / {MAX_TASK_BODY_LENGTH}
              </span>
            </div>

            {error !== null && (
              <p role="alert" className="text-destructive text-xs">
                {error}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground text-sm disabled:opacity-50"
                >
                  キャンセル
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              >
                投稿する
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
