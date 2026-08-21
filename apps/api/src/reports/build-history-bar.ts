import type { Entry } from "@/db/entities/entry.entity";
import type { Habit } from "@/db/entities/habit.entity";
import type { Period } from "@/lib/utils";
import { isSuccess } from "./build-best-streaks";
import {
  addUTCDays,
  bucketStart,
  diffInUTCDays,
  resolveBucketUnit,
  utcDateKey,
} from "./date-buckets";

export type HistoryBarPoint = {
  date: Date;
  count: number;
};

/** Per-bucket count of days the habit was accomplished (goal met/checked
 * off) — unlike buildScoreHistory, which averages a 0-100 completion degree,
 * this is a plain count for a bar graph ("accomplished 5 out of 7 days"). */
export function buildHistoryBar(
  habit: Habit,
  entries: Entry[],
  period: Period,
  range: { from: Date; to: Date },
): HistoryBarPoint[] {
  const bucketUnit = resolveBucketUnit(period);
  const { from, to } = range;

  const entriesByDay = new Map<string, Entry>();
  for (const entry of entries) entriesByDay.set(utcDateKey(entry.date), entry);

  const buckets = new Map<string, HistoryBarPoint>();

  const totalDays = diffInUTCDays(from, to);
  for (let i = 0; i <= totalDays; i++) {
    const day = addUTCDays(from, i);
    const bucketDate = bucketStart(day, bucketUnit);
    const key = utcDateKey(bucketDate);

    const entry = entriesByDay.get(utcDateKey(day));
    const accomplished = Boolean(entry && isSuccess(entry, habit));

    const bucket = buckets.get(key);
    if (bucket) {
      if (accomplished) bucket.count += 1;
    } else {
      buckets.set(key, { date: bucketDate, count: accomplished ? 1 : 0 });
    }
  }

  return Array.from(buckets.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}
