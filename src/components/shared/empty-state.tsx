"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, CalendarCheck } from "lucide-react";
import { Confetti } from "@/components/shared/Confetti";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "hf-panel-strong mx-auto flex w-full max-w-3xl flex-col items-center justify-center rounded-3xl px-4 py-10 text-center sm:py-16 animate-fade-in",
        className
      )}
    >
      {Icon && (
        <div className="mb-5 rounded-2xl border border-border-subtle bg-surface-tint/80 p-3 shadow-[var(--shadow-editorial-sm)] sm:mb-6 sm:p-4">
          <Icon className="h-8 w-8 text-text-muted sm:h-10 sm:w-10" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-5 max-w-xs text-sm text-text-secondary sm:mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function NoHabitsEmpty() {
  return (
    <EmptyState
      icon={CalendarCheck}
      title="开始养成更好的习惯"
      description="创建你的第一个习惯，开始记录你迈向更好生活的每一步。"
      actionLabel="创建你的第一个习惯"
      actionHref="/habits/new"
    />
  );
}

export function NoStatsEmpty() {
  return (
    <EmptyState
      icon={BarChart3}
      title="暂无数据"
      description="完成一些习惯后，这里会显示你的统计和进展。"
    />
  );
}

export function AllCompleteMessage() {
  return (
    <div className="hf-panel-strong relative animate-fade-in overflow-hidden rounded-3xl py-8 text-center">
      <Confetti active />
      <div className="animate-glow-pulse pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-accent-amber/10 via-transparent to-transparent" />
      <div className="relative z-[1]">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          今天全部完成！
        </h3>
        <p className="text-sm text-text-secondary">
          保持坚持，做得很好。明天见！
        </p>
      </div>
    </div>
  );
}
