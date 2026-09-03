import { Entry } from "@/db/entities/entry.entity";
import { HabitType, type Habit } from "@/db/entities/habit.entity";
import {
  addUTCDays,
  diffInUTCDays,
  utcDateKey,
  utcISODay,
} from "./date-buckets";

export type Streak = {
  from: Date;
  to: Date;
  streak_num: number;
};

export const isSuccess = (entry: Entry, habit: Habit): boolean => {
  if (
    habit.type === HabitType.NUMERIC &&
    (entry.value_numeric ?? 0) >= habit.goal_value!
  )
    return true;
  if (habit.type === HabitType.BOOLEAN && entry.value_boolean === true)
    return true;

  return false;
};
export function buildBestStreaks(
  entries: Entry[],
  habit: Habit,
  range: { startDate: Date; endDate: Date },
) {
  const { endDate, startDate } = range;
  const mapEntries = new Map();

  entries.map((entry) => {
    mapEntries.set(utcDateKey(entry.date), entry);
  });

  let currentStreakStart: Date | null = null;
  let currentStreakLength: number = 0;
  let streaks: Streak[] = [];
  let currentStreak: Streak | null = null;

  const totalDays = diffInUTCDays(startDate, endDate);
  for (let i = 0; i <= totalDays; i++) {
    const day = addUTCDays(startDate, i);
    const dayIndex = utcISODay(day);

    const isDayApplicable =
      habit.active_weekdays === null ||
      habit.active_weekdays.includes(dayIndex);

    if (!isDayApplicable) {
      continue;
    }

    const entry = mapEntries.get(utcDateKey(day));
    const success = Boolean(entry && isSuccess(entry, habit));

    if (success) {
      if (currentStreakLength === 0) {
        currentStreakStart = day;
      }
      currentStreakLength += 1;
    } else {
      if (currentStreakLength > 0) {
        streaks.push({
          from: currentStreakStart!,
          to: addUTCDays(day, -1),
          streak_num: currentStreakLength,
        });
      }
      currentStreakLength = 0;
      currentStreakStart = null;
    }
  }

  if (currentStreakLength > 0) {
    currentStreak = {
      from: currentStreakStart!,
      to: endDate,
      streak_num: currentStreakLength,
    };
    streaks.push(currentStreak);
  }

  streaks.sort((a, b) => b.streak_num - a.streak_num);
  streaks = streaks.slice(0, 5);

  return { streaks, currentStreak };
}
