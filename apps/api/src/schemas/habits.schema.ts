import { z } from "@hono/zod-openapi";
import {
  HabitGoalPeriod,
  HabitStatus,
  HabitType,
} from "@/db/entities/habit.entity";
import { PERIODS } from "@/lib/utils";

export const HabitsResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(HabitType),
  unit: z.string().nullable(),
  goal_value: z.number().nullable(),
  goal_period: z.enum(HabitGoalPeriod),
  status: z.enum(HabitStatus),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  archived_at: z.string().datetime().nullable(),
});

export const DeleteHabitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type HabitResponse = z.infer<typeof HabitsResponseSchema>;

export const CreateHabitSchema = HabitsResponseSchema.pick({
  name: true,
  description: true,
  goal_period: true,
  goal_value: true,
  type: true,
  unit: true,
});

export const UpdateHabitSchema = HabitsResponseSchema.pick({
  name: true,
  description: true,
  goal_value: true,
  goal_period: true,
}).partial();

export type UpdateHabitInput = z.infer<typeof UpdateHabitSchema>;

export const StreakSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  streak_num: z.number(),
});

export const BestStreaksResponseSchema = z.array(StreakSchema);

export type StreakResponse = z.infer<typeof StreakSchema>;

export const ScoreHistoryQuerySchema = z.object({
  period: z.enum(PERIODS),
});

export const ScorePointSchema = z.object({
  date: z.string().datetime(),
  percentage: z.number(),
});

export const ScoreHistoryResponseSchema = z.array(ScorePointSchema);

export type ScorePointResponse = z.infer<typeof ScorePointSchema>;

export const CalendarMapResponseSchema = z.array(ScorePointSchema);

export const HistoryBarPointSchema = z.object({
  date: z.string().datetime(),
  count: z.number(),
});

export const HistoryBarResponseSchema = z.array(HistoryBarPointSchema);

export type HistoryBarPointResponse = z.infer<typeof HistoryBarPointSchema>;

const HabitStreakSummarySchema = z.object({
  habit_id: z.string(),
  habit_name: z.string(),
  streak: StreakSchema.nullable(),
});

export const HabitProgressSummaryResponseSchema = z.object({
  streaks: z.array(HabitStreakSummarySchema),
  // % of expected habit-days completed, averaged across active habits.
  week_conclusion_tax: z.number(),
  month_conclusion_tax: z.number(),
});

export type HabitProgressSummaryResponse = z.infer<
  typeof HabitProgressSummaryResponseSchema
>;
