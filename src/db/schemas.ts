import { z } from "zod/v4";
import { isValid, parseISO } from "date-fns";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Validates that a YYYY-MM-DD string represents a real calendar date. */
const dateString = z
  .string()
  .regex(DATE_REGEX, "日期必须为 YYYY-MM-DD 格式")
  .refine(
    (value: string) => isValid(parseISO(value)),
    "日期不是有效的日历日期"
  );

const habitFrequencySchema = z.enum([
  "daily",
  "weekdays",
  "weekends",
  "specific_days",
  "x_per_week",
]);

// Base object schema (without refinements) — used for .omit() / .partial()
const habitBaseSchema = z.object({
  id: z.string().regex(UUID_REGEX, "UUID 格式无效"),
  name: z.string().min(1, "名称为必填项").max(100, "名称过长"),
  description: z.string().max(500, "描述过长").optional(),
  icon: z.string().min(1, "图标为必填项"),
  color: z.string().regex(HEX_COLOR_REGEX, "十六进制颜色格式无效"),
  frequency: habitFrequencySchema,
  targetDays: z.array(z.number().int().min(0).max(6)).optional(),
  targetCount: z.number().int().min(1).max(7).optional(),
  reminderTime: z.string().regex(TIME_REGEX, "时间格式无效").optional(),
  category: z.string().max(50).optional(),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime").optional(),
  habitType: z.enum(["binary", "quantitative"]).default("binary").optional(),
  targetValue: z.number().positive().nullable().optional(),
  unit: z.string().max(20).nullable().optional(),
  chainId: z.string().regex(UUID_REGEX).nullable().optional(),
  chainOrder: z.number().int().nonnegative().nullable().optional(),
  sortOrder: z.number().int(),
  isArchived: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Full schema with cross-field refinements
export const habitSchema = habitBaseSchema
  .refine(
    (data) => {
      if (data.frequency === "specific_days") {
        return data.targetDays !== undefined && data.targetDays.length > 0;
      }
      return true;
    },
    { message: "指定日期频率至少需要选择一个目标日期" }
  )
  .refine(
    (data) => {
      if (data.frequency === "x_per_week") {
        return data.targetCount !== undefined;
      }
      return true;
    },
    { message: "每周次数频率需要设置目标次数" }
  );

export const effortRatingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const habitCompletionSchema = z.object({
  id: z.string().regex(UUID_REGEX, "UUID 格式无效"),
  habitId: z.string().regex(UUID_REGEX, "习惯 ID 格式无效"),
  date: dateString,
  completedAt: z.iso.datetime(),
  note: z.string().max(250, "备注过长").optional(),
  effort: effortRatingSchema.nullable().optional(),
  value: z.number().nonnegative().nullable().optional(),
});

export const userSettingsSchema = z.object({
  id: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  showStreaks: z.boolean(),
  showCompletionRate: z.boolean(),
  defaultView: z.enum(["today", "week", "month"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const habitChainSchema = z.object({
  id: z.string().regex(UUID_REGEX, "UUID 格式无效"),
  name: z.string().min(1, "名称为必填项").max(60, "名称过长"),
  createdAt: z.iso.datetime(),
});

// Derive create/update schemas from the base (no refinements)
export const createHabitSchema = habitBaseSchema.omit({
  id: true,
  sortOrder: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
});

export const updateHabitSchema = createHabitSchema.partial();

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
