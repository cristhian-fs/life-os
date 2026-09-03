import type { Period } from "@/lib/utils";

export type BucketUnit = "day" | "week" | "month";

export function resolveBucketUnit(period: Period): BucketUnit {
  switch (period) {
    case "week":
      return "day";
    case "month":
      return "day";
    case "3months":
      return "week";
    case "6months":
      return "week";
    case "year":
      return "month";
    case "all":
      return "month";
    default:
      return "week";
  }
}

// All date-key/bucket-boundary math below stays in UTC on purpose: date-fns'
// format/startOfWeek/startOfMonth read a Date's calendar fields in the
// server's *local* timezone, which misclassifies dates near a week/month
// boundary whenever the server isn't running in UTC (see entry.entity.ts).
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const utcDateKey = (date: Date) => date.toISOString().slice(0, 10);

export function addUTCDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

// ISO weekday (1 Mon .. 7 Sun) read from the UTC calendar day, for the same
// local-timezone reason as the rest of this file — date-fns' getISODay reads
// the server's local day instead.
export function utcISODay(date: Date): number {
  const utcDay = date.getUTCDay(); // 0 Sun .. 6 Sat
  return utcDay === 0 ? 7 : utcDay;
}

// Calendar-day difference, not a raw ms/86400000 floor: every caller uses
// this to size a "loop one point per day from `from` to `to`" range, and
// `from`/`to` are often raw timestamps (habit.created_at, `new Date()`) with
// whatever time-of-day they happened to occur at. Flooring the raw ms diff
// drops the final day — today — whenever `to`'s time-of-day hasn't yet
// caught up to `from`'s, which is most of any given day. Normalize both to
// UTC midnight first so the result is always the true number of calendar
// days apart.
export function diffInUTCDays(from: Date, to: Date): number {
  const fromDay = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const toDay = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((toDay - fromDay) / MS_PER_DAY);
}

export function utcStartOfWeek(date: Date): Date {
  const dayOfWeek = date.getUTCDay(); // 0 Sun .. 6 Sat
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const start = addUTCDays(date, -daysSinceMonday);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function utcStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function bucketStart(date: Date, unit: BucketUnit): Date {
  if (unit === "day") return date;
  if (unit === "week") return utcStartOfWeek(date);
  return utcStartOfMonth(date);
}
