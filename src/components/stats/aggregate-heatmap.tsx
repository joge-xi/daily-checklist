"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AggregateHeatmapData } from "@/lib/stats-utils";

interface AggregateHeatmapProps {
  data: AggregateHeatmapData;
  today: string;
}

const WEEKS = 52;
const DAY_LABELS = ["", "一", "", "三", "", "五", ""];

function intensityColor(count: number, maxCount: number): string {
  if (count === 0) return "var(--heatmap-0)";
  if (maxCount === 0) return "var(--heatmap-0)";

  const ratio = count / maxCount;
  if (ratio <= 0.25) return "var(--heatmap-1)";
  if (ratio <= 0.5) return "var(--heatmap-2)";
  if (ratio <= 0.75) return "var(--heatmap-3)";
  return "var(--heatmap-4)";
}

export function AggregateHeatmap({ data, today }: AggregateHeatmapProps) {
  const { grid, monthLabels, maxCount } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>活跃度</CardTitle>
        <CardDescription>所有习惯在 52 周内的完成强度</CardDescription>
      </CardHeader>

      <div
        className="overflow-x-auto rounded-2xl border border-border-subtle/70 bg-surface-overlay/45 p-3"
        aria-label="过去 12 个月的习惯完成热力图汇总"
      >
        {/* Month labels */}
        <div className="mb-1 ml-8 flex">
          {monthLabels.map(({ col, label }, i) => {
            const nextCol = monthLabels[i + 1]?.col ?? WEEKS;
            const span = nextCol - col;
            return (
              <div
                key={`${label}-${col}`}
                className="text-[10px] text-text-muted"
                style={{ width: `${span * 14}px`, minWidth: `${span * 14}px` }}
              >
                {label}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-[2px] mr-1 shrink-0">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="h-[10px] w-6 text-[9px] text-text-muted leading-[10px] text-right pr-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {grid.map((col, w) => (
              <div key={w} className="flex flex-col gap-[2px]">
                {col.map((cell) => (
                  <div
                    key={cell.date}
                    className="h-[10px] w-[10px] rounded-[3px]"
                    style={{
                      backgroundColor:
                        cell.date > today
                          ? "transparent"
                          : intensityColor(cell.count, maxCount),
                      opacity: cell.date > today ? 0 : cell.count === 0 ? 0.3 : 1,
                    }}
                    title={`${cell.date}：${cell.count} 次完成`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted">
          <span>少</span>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <div
              key={i}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{
                backgroundColor: intensityColor(
                  ratio * Math.max(maxCount, 1),
                  Math.max(maxCount, 1)
                ),
                opacity: ratio === 0 ? 0.3 : 1,
              }}
            />
          ))}
          <span>多</span>
        </div>
      </div>
    </Card>
  );
}
