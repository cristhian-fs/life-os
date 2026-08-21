import { Entry } from "@/db/entities/entry.entity";
import { HabitType, type Habit } from "@/db/entities/habit.entity";
import { addDays, differenceInDays, format, subDays } from "date-fns";


export type Streak = {
  from: Date;
  to: Date;
  streak_num: number;
};

const toDateKey = (date: Date) => format(date, "yyyy-MM-dd");

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
    mapEntries.set(toDateKey(entry.date), entry);
  });

  let currentStreakStart: Date | null = null;
  let currentStreakLength: number = 0;
  let streaks: Streak[] = [];

  const totalDays = differenceInDays(endDate, startDate);
  for (let i = 0; i <= totalDays; i++) {
    const day = addDays(startDate, i);
    const entry = mapEntries.get(toDateKey(day));
    const success = Boolean(entry && isSuccess(entry, habit));

    if (success) {
      if (currentStreakLength === 0) {
        currentStreakStart = entry.date;
      }
      currentStreakLength += 1;
    } else {
      if (currentStreakLength > 0) {
        streaks.push({
          from: currentStreakStart!,
          to: subDays(day, 1),
          streak_num: currentStreakLength,
        });
      }
      currentStreakLength = 0;
      currentStreakStart = null;
    }
  }

  if (currentStreakLength > 0) {
    streaks.push({
      from: currentStreakStart!,
      to: endDate,
      streak_num: currentStreakLength,
    });
  }

  streaks.sort((a, b) => b.streak_num - a.streak_num);

  return { streaks };
}
