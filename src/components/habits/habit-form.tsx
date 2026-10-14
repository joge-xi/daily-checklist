"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createHabitSchema } from "@/db/schemas";
import type { CreateHabitInput } from "@/db/schemas";
import type { Habit, HabitFrequency, HabitType, TimeOfDay } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "./emoji-picker";
import { ColorPicker } from "./color-picker";
import { FrequencySelector } from "./frequency-selector";
import { TimeOfDaySelector, inferTimeOfDay } from "./time-of-day-selector";
import { useToast } from "@/components/shared/toast";
import { DB_ERROR_MSG, DEFAULT_HABIT_ICON, DEFAULT_X_PER_WEEK_TARGET } from "@/lib/constants";
import { ACCENT_COLORS } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface HabitFormProps {
  initialData?: Habit;
  onSubmit: (data: CreateHabitInput) => Promise<void>;
  submitLabel: string;
}

type FormErrors = Partial<Record<keyof CreateHabitInput, string>>;

function mapZodErrors(issues: { path: PropertyKey[]; message: string }[]): FormErrors {
  const fieldErrors: FormErrors = {};
  for (const issue of issues) {
    const path = issue.path[0];
    if (path && typeof path === "string") {
      fieldErrors[path as keyof CreateHabitInput] = issue.message;
    }
  }
  return fieldErrors;
}

export function HabitForm({ initialData, onSubmit, submitLabel }: HabitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? DEFAULT_HABIT_ICON);
  const [color, setColor] = useState(initialData?.color ?? ACCENT_COLORS[0].value);
  const [frequency, setFrequency] = useState<HabitFrequency>(
    initialData?.frequency ?? "daily"
  );
  const [targetDays, setTargetDays] = useState<number[]>(
    initialData?.targetDays ?? []
  );
  const [targetCount, setTargetCount] = useState(initialData?.targetCount ?? DEFAULT_X_PER_WEEK_TARGET);
  const [reminderTime, setReminderTime] = useState(initialData?.reminderTime ?? "");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    initialData?.timeOfDay ?? "anytime"
  );
  const [habitType, setHabitType] = useState<HabitType>(
    initialData?.habitType ?? "binary"
  );
  const [quantTargetValue, setQuantTargetValue] = useState<string>(
    initialData?.targetValue != null ? String(initialData.targetValue) : ""
  );
  const [unit, setUnit] = useState(initialData?.unit ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((): CreateHabitInput | null => {
    const parsedTargetValue = quantTargetValue ? Number(quantTargetValue) : null;

    const data: CreateHabitInput = {
      name: name.trim(),
      icon,
      color,
      frequency,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(frequency === "specific_days" ? { targetDays } : {}),
      ...(frequency === "x_per_week" ? { targetCount } : {}),
      ...(reminderTime ? { reminderTime } : {}),
      timeOfDay,
      habitType,
      ...(habitType === "quantitative" ? {
        targetValue: parsedTargetValue,
        unit: unit.trim() || null,
      } : {}),
      ...(category.trim() ? { category: category.trim() } : {}),
    };

    const result = createHabitSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = mapZodErrors(result.error.issues);

      // Handle cross-field validation from the base schema
      if (frequency === "specific_days" && targetDays.length === 0) {
        fieldErrors.targetDays = "请至少选择一天";
      }
      if (frequency === "x_per_week" && (!targetCount || targetCount < 1 || targetCount > 7)) {
        fieldErrors.targetCount = "必须在 1 到 7 之间";
      }

      setErrors(fieldErrors);

      // Scroll to first error
      const firstErrorField = formRef.current?.querySelector("[data-error]");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });

      return null;
    }

    setErrors({});
    return result.data;
  }, [name, description, icon, color, frequency, targetDays, targetCount, reminderTime, timeOfDay, habitType, quantTargetValue, unit, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;

    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      logger.error("Form submission failed:", error);
      toast(DB_ERROR_MSG, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <Card variant="elevated">
        <div className="space-y-2" data-error={errors.name ? "" : undefined}>
          <p className="hf-kicker">基本信息</p>
          <Label htmlFor="name">名称 *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：晨跑"
            maxLength={100}
          />
          {errors.name && (
            <p className="text-xs text-error">{errors.name}</p>
          )}
        </div>
      </Card>

      {/* Habit Type */}
      <Card>
        <div className="space-y-3">
          <p className="hf-kicker">类型</p>
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-sm font-medium text-text-primary mb-2">习惯类型</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["binary", "quantitative"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setHabitType(type)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-[background-color,border-color,color,box-shadow]",
                    "focus-visible:ring-2 focus-visible:ring-accent-blue",
                    habitType === type
                      ? "border-accent-blue bg-accent-blue/8 text-accent-blue"
                      : "border-border-subtle bg-surface-paper/50 text-text-muted hover:text-text-secondary"
                  )}
                >
                  {type === "binary" ? "完成 / 未完成" : "记录一个数值"}
                </button>
              ))}
            </div>
          </fieldset>
          {habitType === "quantitative" && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="quantTarget">每日目标</Label>
                <Input
                  id="quantTarget"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={quantTargetValue}
                  onChange={(e) => setQuantTargetValue(e.target.value)}
                  placeholder="例如：8"
                />
                <p className="text-xs text-text-muted">可选</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="unit">单位</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="例如：杯、公里、页"
                  maxLength={20}
                />
                <p className="text-xs text-text-muted">可选，最多 20 个字符</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Description */}
      <Card>
        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="可选描述…"
            maxLength={500}
          />
        </div>
      </Card>

      {/* Icon */}
      <Card>
        <div className="space-y-2" data-error={errors.icon ? "" : undefined}>
          <p className="hf-kicker">标识</p>
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-sm font-medium text-text-primary mb-1">图标</legend>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-surface-paper text-3xl shadow-[var(--shadow-editorial-sm)]">
                {icon}
              </div>
              <span className="text-sm text-text-secondary">
                选择一个代表这个习惯的图标
              </span>
            </div>
            <EmojiPicker value={icon} onChange={setIcon} />
            {errors.icon && (
              <p className="text-xs text-error">{errors.icon}</p>
            )}
          </fieldset>
        </div>
      </Card>

      {/* Color */}
      <Card>
        <div className="space-y-2">
          <p className="hf-kicker">颜色</p>
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-sm font-medium text-text-primary mb-1">颜色</legend>
            <ColorPicker value={color} onChange={setColor} />
          </fieldset>
        </div>
      </Card>

      {/* Frequency */}
      <Card variant="elevated">
        <div
          className="space-y-2"
          data-error={errors.targetDays || errors.targetCount ? "" : undefined}
        >
          <p className="hf-kicker">日程</p>
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-sm font-medium text-text-primary mb-1">频率 *</legend>
            <FrequencySelector
              frequency={frequency}
              targetDays={targetDays}
              targetCount={targetCount}
              onFrequencyChange={setFrequency}
              onTargetDaysChange={setTargetDays}
              onTargetCountChange={setTargetCount}
            />
            {errors.targetDays && (
              <p className="text-xs text-error">{errors.targetDays}</p>
            )}
            {errors.targetCount && (
              <p className="text-xs text-error">{errors.targetCount}</p>
            )}
          </fieldset>
        </div>
      </Card>

      {/* Time of Day */}
      <Card>
        <div className="space-y-2">
          <p className="hf-kicker">时间安排</p>
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-sm font-medium text-text-primary mb-1">你通常在什么时候做这件事？</legend>
            <TimeOfDaySelector value={timeOfDay} onChange={setTimeOfDay} />
          </fieldset>
        </div>
      </Card>

      {/* Reminder Time */}
      <Card>
        <div className="space-y-2">
          <p className="hf-kicker">提醒</p>
          <Label htmlFor="reminderTime">提醒时间</Label>
          <Input
            id="reminderTime"
            type="time"
            value={reminderTime}
            onChange={(e) => {
              setReminderTime(e.target.value);
              // Auto-infer time-of-day from reminder if user hasn't explicitly set one
              if (timeOfDay === "anytime" && e.target.value) {
                setTimeOfDay(inferTimeOfDay(e.target.value));
              }
            }}
          />
          <p className="text-xs text-text-muted">可选</p>
        </div>
      </Card>

      {/* Category */}
      <Card>
        <div className="space-y-2">
          <p className="hf-kicker">分组</p>
          <Label htmlFor="category">分类</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如：健身、健康、心态"
            maxLength={50}
          />
          <p className="text-xs text-text-muted">可选 — 按分类对习惯进行分组</p>
        </div>
      </Card>

      {/* Actions */}
      <div className="hf-panel rounded-2xl flex gap-3 p-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1 sm:flex-none"
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1 sm:flex-none"
        >
          {submitting ? "保存中…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
