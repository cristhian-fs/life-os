import { z } from "@hono/zod-openapi";

export const EntriesResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  habit_id: z.string(),
  date: z.string().datetime(),
  value_boolean: z.boolean().nullable(),
  value_numeric: z.number().nullable(),
  note: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const DeleteEntryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type EntryResponse = z.infer<typeof EntriesResponseSchema>;

export const CreateEntrySchema = EntriesResponseSchema.pick({
  habit_id: true,
  date: true,
  value_boolean: true,
  value_numeric: true,
  note: true,
});

export const UpdateEntrySchema = EntriesResponseSchema.pick({
  date: true,
  value_boolean: true,
  value_numeric: true,
  note: true,
}).partial();

export type UpdateEntryInput = z.infer<typeof UpdateEntrySchema>;

export const ListEntriesQuerySchema = z.object({
  habitId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type ListEntriesQuery = z.infer<typeof ListEntriesQuerySchema>;
