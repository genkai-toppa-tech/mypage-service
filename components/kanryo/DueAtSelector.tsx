"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { DUE_AT_MINUTE_PRESETS, type DueAtSelection } from "@/lib/kanryo/due-at";
import { cn } from "@/lib/utils";

type DueAtSelectorProps = {
  value: DueAtSelection;
  onChange: (value: DueAtSelection) => void;
};

const MINUTES_IN_DAY = 24 * 60;

/** Date を <input type="time"> が受け付ける "HH:mm" にする（ローカル時刻）。 */
function toTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/** "HH:mm" を deltaMinutes 分ずらす。0:00〜23:59 の範囲を超える場合は日をまたいでループする。 */
function stepTime(time: string, deltaMinutes: number): string | null {
  const [hours, minutes] = time.split(":").map(Number);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  const total =
    (((hours * 60 + minutes + deltaMinutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;

  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * 制限時間の選択。ワンタップの候補ボタンに加え、時刻を直接指定できる。
 * プリセットを選んでいる間、時刻欄には「現在時刻＋選択中の分数」がプレビューとして表示され続ける。
 * 時刻欄を直接編集する・微調整ボタンを押すと、その時刻指定に切り替わる（プリセットの選択状態は解除される）。
 *
 * 時刻欄自体はPC・スマホ共通の <input type="time"> とし、直接入力・OS標準のピッカー
 * （スマホでタップした際の時・分スクロール選択）の両方を活かす。微調整ボタンはPCでのみ表示する
 * （スマホではタップでOS標準のピッカーが開くため、ボタンを出すとかえって邪魔になる）。
 */
export function DueAtSelector({ value, onChange }: DueAtSelectorProps) {
  const customInputId = useId();
  const [now, setNow] = useState(() => new Date());

  // プリセット選択中の時刻プレビューを最新に保つ
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

  const timeInputValue =
    value.mode === "preset"
      ? toTimeInputValue(new Date(now.getTime() + value.minutes * 60_000))
      : value.time;

  function handlePresetClick(minutes: number) {
    onChange({ mode: "preset", minutes });
  }

  function handleTimeChange(time: string) {
    onChange({ mode: "custom", time });
  }

  function handleStep(deltaMinutes: number) {
    const stepped = stepTime(timeInputValue, deltaMinutes);

    if (stepped !== null) {
      onChange({ mode: "custom", time: stepped });
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
            aria-pressed={value.mode === "preset" && value.minutes === minutes}
            onClick={() => handlePresetClick(minutes)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value.mode === "preset" && value.minutes === minutes
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
          時刻
        </label>
        <input
          id={customInputId}
          type="time"
          value={timeInputValue}
          onChange={(event) => handleTimeChange(event.target.value)}
          className="border-border focus-visible:ring-ring rounded-md border bg-transparent px-2 py-1 text-xs focus-visible:ring-2 focus-visible:outline-none"
        />

        <div className="hidden md:flex md:flex-col">
          <button
            type="button"
            aria-label="1分進める"
            onClick={() => handleStep(1)}
            className="border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-t-sm border border-b-0 px-1 leading-none focus-visible:ring-2 focus-visible:outline-none"
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            aria-label="1分戻す"
            onClick={() => handleStep(-1)}
            className="border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-b-sm border px-1 leading-none focus-visible:ring-2 focus-visible:outline-none"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>
      </div>
    </fieldset>
  );
}
