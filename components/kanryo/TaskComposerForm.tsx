"use client";

import { useId, useState } from "react";

import { DueAtSelector } from "@/components/kanryo/DueAtSelector";
import {
  DEFAULT_DUE_AT_MINUTES,
  resolveDueMinutes,
  validateDueMinutes,
  type DueAtSelection,
} from "@/lib/kanryo/due-at";
import {
  countTaskBodyLength,
  MAX_TASK_BODY_LENGTH,
  validateTaskBody,
} from "@/lib/kanryo/validation";
import { cn } from "@/lib/utils";

type TaskComposerFormProps = {
  onSubmit: (input: { body: string; dueMinutes: number }) => Promise<void>;
  /** 指定するとキャンセルボタンを表示する。 */
  onCancel?: () => void;
  /** 投稿成功後に呼ばれる（フォームのリセット後）。 */
  onSuccess?: () => void;
  className?: string;
  /**
   * アクションボタン（キャンセル・投稿する）の配置。
   * "footer"（デフォルト）: 本文・制限時間の下にまとめて右寄せで表示する（PCの常時表示パネル向け）。
   * "header": フォーム最上部にヘッダー行として表示する（キャンセルを左、投稿するを右）。
   * フルスクリーン投稿画面で、本来ヘッダーがあった位置にボタンを配置するために使う。
   */
  actionsPlacement?: "footer" | "header";
};

/**
 * 完了の間の投稿フォーム。本文入力・制限時間の選択・投稿を行う。
 * モバイルのフルスクリーン投稿画面（TaskComposerDialog）とPCの常時表示パネル
 * （TaskComposerPanel）の両方から再利用される。
 */
export function TaskComposerForm({
  onSubmit,
  onCancel,
  onSuccess,
  className,
  actionsPlacement = "footer",
}: TaskComposerFormProps) {
  const textareaId = useId();
  const [body, setBody] = useState("");
  const [dueAtSelection, setDueAtSelection] = useState<DueAtSelection>({
    mode: "preset",
    minutes: DEFAULT_DUE_AT_MINUTES,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const length = countTaskBodyLength(body);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bodyValidation = validateTaskBody(body);

    if (!bodyValidation.ok) {
      setError(bodyValidation.message);
      return;
    }

    // 時刻指定は投稿するタイミングによって残り分数が変わるため、投稿の直前に解決する
    const dueMinutes = resolveDueMinutes(dueAtSelection, new Date());
    const dueMinutesValidation = validateDueMinutes(dueMinutes);

    if (!dueMinutesValidation.ok) {
      setError(dueMinutesValidation.message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ body, dueMinutes });
      setBody("");
      setDueAtSelection({ mode: "preset", minutes: DEFAULT_DUE_AT_MINUTES });
      setError(null);
      onSuccess?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitButton = (
    <button
      type="submit"
      disabled={isSubmitting}
      className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
    >
      投稿する
    </button>
  );

  const cancelButton = onCancel !== undefined && (
    <button
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="text-muted-foreground hover:text-foreground text-sm disabled:opacity-50"
    >
      キャンセル
    </button>
  );

  const fields = (
    <>
      <label htmlFor={textareaId} className="sr-only">
        完了の間の本文
      </label>
      <textarea
        id={textareaId}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="例: 水を飲む"
        rows={2}
        // text-base（16px）未満だと iOS Safari がフォーカス時に自動ズームしてしまうため、
        // スマホ幅では16px以上にする（PCでは見た目を変えないよう text-sm に戻す）
        className="border-border focus-visible:ring-ring w-full resize-none rounded-md border bg-transparent px-3 py-2 text-base focus-visible:ring-2 focus-visible:outline-none md:text-sm"
      />

      <DueAtSelector value={dueAtSelection} onChange={setDueAtSelection} />

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
    </>
  );

  if (actionsPlacement === "header") {
    return (
      <form onSubmit={handleSubmit} noValidate className={cn("flex flex-col", className)}>
        <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
          {cancelButton}
          {submitButton}
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">{fields}</div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("flex flex-col gap-3", className)}>
      {fields}

      <div className="mt-2 flex justify-end gap-3">
        {cancelButton}
        {submitButton}
      </div>
    </form>
  );
}
