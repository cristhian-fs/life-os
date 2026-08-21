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

export function diffInUTCDays(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
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
