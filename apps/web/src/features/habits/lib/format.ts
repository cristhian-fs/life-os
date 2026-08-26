import { HabitGoalPeriod, HabitType } from '#/types/api'
import type { Habit } from '#/types/api'

export const goalPeriodLabel: Record<HabitGoalPeriod, string> = {
  [HabitGoalPeriod.DAILY]: 'Daily',
  [HabitGoalPeriod.WEEKLY]: 'Weekly',
  [HabitGoalPeriod.MONTHLY]: 'Monthly',
}

/** Short goal line shown on a habit card, e.g. "Daily · 30 min" or "Weekly". */
export function formatGoal(habit: Habit): string {
  const period = goalPeriodLabel[habit.goal_period]
  if (habit.type !== HabitType.NUMERIC) return period
  const unit = habit.unit ? ` ${habit.unit}` : ''
  return `${period} · ${habit.goal_value ?? '—'}${unit}`
}
