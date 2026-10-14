"use client";

import { DailyProgressRing } from "./daily-progress-ring";

interface CompactProgressBarProps {
  completed: number;
  total: number;
}

export function CompactProgressBar({ completed, total }: CompactProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(total - completed, 0);

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="rounded-2xl border border-border-subtle bg-surface-paper/75 p-1 shadow-[var(--shadow-editorial-sm)]">
        <DailyProgressRing
          completed={completed}
          total={total}
          className="scale-[0.34] -m-11"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">
            已完成 {completed} / {total}
          </span>
          <span className="rounded-full bg-accent-blue/12 px-2 py-0.5 text-xs font-semibold text-accent-blue">
            {percentage}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-border-subtle/70 bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent-blue transition-[width] duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          {remaining === 0
            ? "今天安排的所有事项都已完成。"
            : `今天还剩 ${remaining} 个习惯。`}
        </p>
      </div>
    </div>
  );
}
