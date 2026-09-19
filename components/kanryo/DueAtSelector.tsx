"use client";

import { useEffect, useId, useState } from "react";

import { DUE_AT_MINUTE_PRESETS } from "@/lib/kanryo/due-at";
import { cn } from "@/lib/utils";

type DueAtSelectorProps = {
  value: number;
  onChange: (minutes: number) => void;
};

/** 制限時間の選択。ワンタップの候補ボタンに加え、任意の分数をカスタム入力できる。 */
export function DueAtSelector({ value, onChange }: DueAtSelectorProps) {
  const customInputId = useId();
  // 入力途中の空文字などをそのまま表示できるよう、表示用の文字列を別に持つ。
  // value をそのまま input の value にすると、無効な入力のたびに直前の値へ巻き戻ってしまう。
  const [customText, setCustomText] = useState(String(value));

  useEffect(() => {
    setCustomText(String(value));
  }, [value]);

  function handlePresetClick(minutes: number) {
    setCustomText(String(minutes));
    onChange(minutes);
  }

  function handleCustomChange(text: string) {
    setCustomText(text);

    const parsed = Number(text);

    if (text.trim() !== "" && Number.isFinite(parsed)) {
      onChange(parsed);
    }
  }

  return (
    <fieldset className="flex flex-col gap-2 border-none p-0">
      <legend className="sr-only">制限時間</legend>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {DUE_AT_MINUTE_PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            aria-pressed={value === minutes}
            onClick={() => handlePresetClick(minutes)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value === minutes
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            +{minutes}分
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={customInputId} className="text-muted-foreground text-xs">
          カスタム
        </label>
        <input
          id={customInputId}
          type="number"
          min={1}
          inputMode="numeric"
          value={customText}
          onChange={(event) => handleCustomChange(event.target.value)}
          className="border-border focus-visible:ring-ring w-16 rounded-md border bg-transparent px-2 py-1 text-xs focus-visible:ring-2 focus-visible:outline-none"
        />
        <span className="text-muted-foreground text-xs">分後</span>
      </div>
    </fieldset>
  );
}
