import { addUTCDays, todayUTC, utcStartOfWeek } from '#/lib/date'
import type { HabitCalendarMapResponse } from '#/types/api'

const DAYS_SHOWN = 365
const MS_PER_DAY = 24 * 60 * 60 * 1000

export type HeatmapCell =
  // Padding before the fixed window starts (a week never starts exactly on
  // day 1) or after today — not a real day, nothing to render as a cell.
  | { kind: 'empty' }
  // A real calendar day, but before the habit existed — the API's reports
  // never look this far back, so it can never carry data.
  | { kind: 'before-habit'; date: Date }
  | {
      kind: 'day'
      date: Date
      point: HabitCalendarMapResponse[number] | undefined
    }

export type HeatmapWeek = {
  weekStart: Date
  showMonth: boolean
  days: HeatmapCell[]
}

/**
 * A GitHub-contribution-style grid: always the fixed 365-day window ending
 * `end` (today by default), right-aligned. Pure — no rendering, no
 * mutations — so the grid shape (right-alignment, month-label placement,
 * before-habit padding) is testable without mounting anything.
 *
 * All math stays in UTC (see #/lib/date.ts) — the habits API's dates are
 * UTC-midnight-normalized, and local-time date math would shift the whole
 * grid a day off for anyone west of UTC.
 */
export function buildHeatmapGrid(
  habitCreatedAt: string,
  data: HabitCalendarMapResponse,
  end: Date = new Date(todayUTC()),
): HeatmapWeek[] {
  const gridStart = utcStartOfWeek(addUTCDays(end, -(DAYS_SHOWN - 1)))
  const totalWeeks = Math.ceil(
    (Math.round((end.getTime() - gridStart.getTime()) / MS_PER_DAY) + 1) / 7,
  )
  const byDate = new Map(data.map((point) => [point.date.slice(0, 10), point]))
  const habitStartKey = habitCreatedAt.slice(0, 10)

  return Array.from({ length: totalWeeks }, (_, week) => {
    const weekStart = addUTCDays(gridStart, week * 7)
    const showMonth = week === 0 || weekStart.getUTCDate() <= 7 // first week the month changes

    const days: HeatmapCell[] = Array.from({ length: 7 }, (__, day) => {
      const date = addUTCDays(weekStart, day)
      if (date < gridStart || date > end) return { kind: 'empty' }
      const key = date.toISOString().slice(0, 10)
      if (key < habitStartKey) return { kind: 'before-habit', date }
      return { kind: 'day', date, point: byDate.get(key) }
    })

    return { weekStart, showMonth, days }
  })
}
