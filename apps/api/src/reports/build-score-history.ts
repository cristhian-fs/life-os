import type { Entry } from "@/db/entities/entry.entity";
import { HabitType, type Habit } from "@/db/entities/habit.entity";
import type { Period } from "@/lib/utils";

export type ScorePoint = {
  date: Date;
  percentage: number;
};

function resolveBucketUnit(period: Period): "day" | "week" | "month" {
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

const utcDateKey = (date: Date) => date.toISOString().slice(0, 10);

function addUTCDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

function diffInUTCDays(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

function utcStartOfWeek(date: Date): Date {
  const dayOfWeek = date.getUTCDay(); // 0 Sun .. 6 Sat
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const start = addUTCDays(date, -daysSinceMonday);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function utcStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function bucketStart(date: Date, unit: "day" | "week" | "month"): Date {
  if (unit === "day") return date;
  if (unit === "week") return utcStartOfWeek(date);
  return utcStartOfMonth(date);
}

// How "done" a single day was, 0-100. A day with no entry is 0% — same
// no-entry-means-not-done rule buildBestStreaks uses for pass/fail.
function dayScore(entry: Entry | undefined, habit: Habit): number {
  if (!entry) return 0;

  if (habit.type === HabitType.BOOLEAN) {
    return entry.value_boolean ? 100 : 0;
  }

  if (habit.type === HabitType.NUMERIC) {
    const goal = habit.goal_value ?? 0;
    if (goal <= 0) return 0;
    return Math.min(100, ((entry.value_numeric ?? 0) / goal) * 100);
  }

  return 0;
}

export function buildScoreHistory(
  habit: Habit,
  entries: Entry[],
  period: Period,
  range: { from: Date; to: Date },
): ScorePoint[] {
  const bucketUnit = resolveBucketUnit(period);
  const { from, to } = range;

  const entriesByDay = new Map<string, Entry>();
  for (const entry of entries) entriesByDay.set(utcDateKey(entry.date), entry);

  const buckets = new Map<string, { date: Date; total: number; count: number }>();

  const totalDays = diffInUTCDays(from, to);
  for (let i = 0; i <= totalDays; i++) {
    const day = addUTCDays(from, i);
    const bucketDate = bucketStart(day, bucketUnit);
    const key = utcDateKey(bucketDate);
    const score = dayScore(entriesByDay.get(utcDateKey(day)), habit);

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.total += score;
      bucket.count += 1;
    } else {
      buckets.set(key, { date: bucketDate, total: score, count: 1 });
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((bucket) => ({
      date: bucket.date,
      percentage: Math.round(bucket.total / bucket.count),
    }));
}
