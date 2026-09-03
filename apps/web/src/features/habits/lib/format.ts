import i18n from '#/i18n'
import { HabitGoalPeriod, HabitType } from '#/types/api'
import type { Habit } from '#/types/api'

// A Record<HabitGoalPeriod, string> lookup would widen the key to `string`,
// which i18next's typed t() rejects — a switch keeps each call site literal.
export function goalPeriodLabel(period: HabitGoalPeriod): string {
  switch (period) {
    case HabitGoalPeriod.DAILY:
      return i18n.t('habits.form.periodDaily')
    case HabitGoalPeriod.WEEKLY:
      return i18n.t('habits.form.periodWeekly')
    case HabitGoalPeriod.MONTHLY:
      return i18n.t('habits.form.periodMonthly')
  }
}

/** Short goal line shown on a habit card, e.g. "Daily · 30 min" or "Weekly". */
export function formatGoal(habit: Habit): string {
  const period = goalPeriodLabel(habit.goal_period)
  if (habit.type !== HabitType.NUMERIC) return period
  const unit = habit.unit ? ` ${habit.unit}` : ''
  return `${period} · ${habit.goal_value ?? '—'}${unit}`
}

/** "All days" when unrestricted (or all 7 picked), else "N days/week". */
export function formatWeekdays(habit: Habit): string {
  const days = habit.active_weekdays
  if (!days || days.length === 7) return i18n.t('habits.card.allDays')
  return i18n.t('habits.card.daysPerWeek', { count: days.length })
}
