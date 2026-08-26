import { HabitType } from '#/types/api'
import type { Entry, Habit, HabitBestStreaksResponse } from '#/types/api'
import { isToday, isYesterday, parseISO } from 'date-fns'

/** Whether today's entry (if any) satisfies the habit's goal. */
export function isDoneToday(habit: Habit, todayEntry: Entry | null) {
  return habit.type === HabitType.BOOLEAN
    ? todayEntry?.value_boolean === true
    : (todayEntry?.value_numeric ?? 0) >= (habit.goal_value ?? Infinity)
}

/**
 * Best-ever streak length, and the current streak — 0 once the most recent
 * streak's last day is older than yesterday (i.e. it's lapsed).
 */
export function deriveStreaks(
  bestStreaks: HabitBestStreaksResponse | undefined,
) {
  const bestStreak = bestStreaks?.[0]?.streak_num ?? 0
  const latest = bestStreaks
    ? [...bestStreaks].sort(
        (a, b) => parseISO(b.to).getTime() - parseISO(a.to).getTime(),
      )[0]
    : undefined
  const currentStreak =
    latest && (isToday(parseISO(latest.to)) || isYesterday(parseISO(latest.to)))
      ? latest.streak_num
      : 0
  return { bestStreak, currentStreak }
}
