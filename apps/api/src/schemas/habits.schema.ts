import { z } from "@hono/zod-openapi";
import {
  HabitGoalPeriod,
  HabitStatus,
  HabitType,
} from "@/db/entities/habit.entity";

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
