import type { Entry } from "@/db/entities/entry.entity";
import { HabitType, type Habit } from "@/db/entities/habit.entity";
import type { Period } from "@/lib/utils";
import {
  bucketStart,
  diffInUTCDays,
  resolveBucketUnit,
  addUTCDays,
  utcDateKey,
} from "./date-buckets";

export type ScorePoint = {
  date: Date;
  percentage: number;
};

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

/** One score point per calendar day in [from, to] (UTC), unbucketed — the
 * primitive both buildScoreHistory and buildCalendarMap aggregate from. */
export function computeDailyScores(
  habit: Habit,
  entries: Entry[],
  range: { from: Date; to: Date },
): ScorePoint[] {
  const { from, to } = range;

  const entriesByDay = new Map<string, Entry>();
  for (const entry of entries) entriesByDay.set(utcDateKey(entry.date), entry);

  const points: ScorePoint[] = [];
  const totalDays = diffInUTCDays(from, to);
  for (let i = 0; i <= totalDays; i++) {
    const day = addUTCDays(from, i);
    points.push({
      date: day,
      percentage: dayScore(entriesByDay.get(utcDateKey(day)), habit),
    });
  }

  return points;
}

export function buildScoreHistory(
  habit: Habit,
  entries: Entry[],
  period: Period,
  range: { from: Date; to: Date },
): ScorePoint[] {
  const bucketUnit = resolveBucketUnit(period);
  const dailyScores = computeDailyScores(habit, entries, range);

  if (bucketUnit === "day") return dailyScores;

  const buckets = new Map<string, { date: Date; total: number; count: number }>();
  for (const point of dailyScores) {
    const bucketDate = bucketStart(point.date, bucketUnit);
    const key = utcDateKey(bucketDate);

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.total += point.percentage;
      bucket.count += 1;
    } else {
      buckets.set(key, { date: bucketDate, total: point.percentage, count: 1 });
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((bucket) => ({
      date: bucket.date,
      percentage: Math.round(bucket.total / bucket.count),
    }));
}
