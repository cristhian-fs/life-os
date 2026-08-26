/**
 * ISO string for today at UTC midnight. The habits API buckets/streaks are
 * computed in UTC only (see apps/api's date-buckets.ts) — stay in UTC here
 * too or entries land on the wrong day for users west of UTC.
 */
export function todayUTC(): string {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString()
}

/**
 * date-fns' addDays/startOfWeek/etc. read and write a Date's *local*
 * calendar fields — on a server or browser west of UTC that silently shifts
 * a UTC-midnight date back a day (see the entries/best-streaks bugs this
 * session already hit). Use these instead for anything walking the fixed
 * UTC-day grid the habits API deals in.
 */
export function addUTCDays(date: Date, amount: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + amount)
  return result
}

/** Sunday-start week boundary, in UTC. */
export function utcStartOfWeek(date: Date): Date {
  const start = addUTCDays(date, -date.getUTCDay())
  start.setUTCHours(0, 0, 0, 0)
  return start
}
