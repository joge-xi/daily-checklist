"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { HabitFrequency } from "@/types";

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: "daily", label: "每天" },
  { value: "weekdays", label: "工作日" },
  { value: "weekends", label: "周末" },
  { value: "specific_days", label: "指定日期" },
  { value: "x_per_week", label: "每周 N 次" },
];

const DAY_LABELS = [
  { value: 0, label: "日" },
  { value: 1, label: "一" },
  { value: 2, label: "二" },
  { value: 3, label: "三" },
  { value: 4, label: "四" },
  { value: 5, label: "五" },
  { value: 6, label: "六" },
];

const FULL_DAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

interface FrequencySelectorProps {
  frequency: HabitFrequency;
  targetDays: number[];
  targetCount: number;
  onFrequencyChange: (frequency: HabitFrequency) => void;
  onTargetDaysChange: (days: number[]) => void;
  onTargetCountChange: (count: number) => void;
}

export function FrequencySelector({
  frequency,
  targetDays,
  targetCount,
  onFrequencyChange,
  onTargetDaysChange,
  onTargetCountChange,
}: FrequencySelectorProps) {
  const toggleDay = (day: number) => {
    if (targetDays.includes(day)) {
      onTargetDaysChange(targetDays.filter((d) => d !== day));
    } else {
      onTargetDaysChange([...targetDays, day].sort());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FREQUENCY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFrequencyChange(opt.value)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium border",
              "transition-colors duration-150",
              frequency === opt.value
                ? "bg-accent-blue/10 text-accent-blue border-accent-blue/20"
                : "bg-surface text-text-secondary border-border-subtle hover:bg-surface-elevated"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {frequency === "specific_days" && (
        <div className="flex gap-2">
          {DAY_LABELS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "h-10 w-10 rounded-lg text-sm font-medium",
                "transition-colors duration-150",
                targetDays.includes(day.value)
                  ? "bg-accent-blue text-white"
                  : "bg-surface text-text-secondary border border-border-subtle hover:bg-surface-elevated"
              )}
              aria-label={`切换${FULL_DAY_NAMES[day.value]}`}
              aria-pressed={targetDays.includes(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>
      )}

      {frequency === "x_per_week" && (
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            max={7}
            value={targetCount}
            onChange={(e) => onTargetCountChange(Number(e.target.value))}
            className="w-20"
            aria-label="每周次数"
          />
          <span className="text-sm text-text-secondary">每周次数</span>
        </div>
      )}
    </div>
  );
}
