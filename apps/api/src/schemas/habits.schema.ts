import { z } from "@hono/zod-openapi";

export const HabitsResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(["boolean", "numeric"]),
  unit: z.string().nullable(),
  goal_value: z.number().nullable(),
  goal_period: z.enum(["daily", "weekly", "monthly"]),
  status: z.enum(["active", "archived"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  archived_at: z.string().datetime().nullable(),
});

export type HabitResponse = z.infer<typeof HabitsResponseSchema>;
