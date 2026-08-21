import { AppDataSource } from "@/db/data-source";
import type { Habit } from "@/db/entities/habit.entity";
import { subDays } from "date-fns";

export async function ensureInitialized() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  return AppDataSource;
}

export const PERIODS = [
  "week",
  "month",
  "3months",
  "6months",
  "year",
  "all",
] as const;

export type Period = (typeof PERIODS)[number];

export function resolveDateRange(
  period: Period,
  habit: Habit,
): { from: Date; to: Date } {
  const today = new Date();
  const habitEnd = habit.archived_at ?? today;

  if (period === "all") {
    return { from: habit.created_at, to: habitEnd };
  }

  const daysMap: Record<Exclude<Period, "all">, number> = {
    week: 7,
    month: 30,
    "3months": 90,
    "6months": 180,
    year: 365,
  };

  const requestedFrom = subDays(today, daysMap[period]);

  return {
    from: requestedFrom > habit.created_at ? requestedFrom : habit.created_at,
    to: habitEnd,
  };
}
