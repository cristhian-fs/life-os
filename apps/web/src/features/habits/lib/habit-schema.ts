import { HabitGoalPeriod, HabitType } from '#/types/api'
import * as z from 'zod'

/**
 * The full shape of "a habit" as the create form and the create-habit
 * mutation both need it. Un-refined (plain ZodObject) so update-habit can
 * still `.pick()` its own narrower subset from it — `.pick()`/`.partial()`
 * aren't available once `.superRefine()` wraps a schema in ZodEffects.
 */
export const habitFieldsSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().min(1, 'Description required'),
  icon: z.string().nullable(),
  goal_value: z.number().nullable(),
  goal_period: z.enum(HabitGoalPeriod),
  type: z.enum(HabitType),
  // Only numeric habits track a unit/goal value — a boolean habit is just done-or-not.
  unit: z.string().nullable(),
  active_weekdays: z.array(z.number().min(1).max(7)).nullable(),
})

type HabitNumericFields = Pick<
  z.infer<typeof habitFieldsSchema>,
  'type' | 'unit' | 'goal_value'
>

/** Numeric habits need a unit and a goal; boolean habits don't have either. */
export function withNumericGoalInvariant<
  T extends z.ZodType<HabitNumericFields>,
>(schema: T) {
  return schema.superRefine(({ type, unit, goal_value }, ctx) => {
    if (type !== HabitType.NUMERIC) return
    if (!unit || unit.trim().length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Unit required', path: ['unit'] })
    }
    if (goal_value === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Goal required',
        path: ['goal_value'],
      })
    }
  })
}

/** The create form and createHabit's network input both validate against this. */
export const habitSchema = withNumericGoalInvariant(habitFieldsSchema)
