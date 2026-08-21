import type { Entry } from "@/db/entities/entry.entity";
import type { Habit } from "@/db/entities/habit.entity";
import { computeDailyScores, type ScorePoint } from "./build-score-history";

export type CalendarDay = ScorePoint;

/** One score point per calendar day across the habit's full lifetime
 * (created_at..archived_at, or now if it's still active) — a GitHub-style
 * contribution heatmap, unlike buildScoreHistory which buckets by period. */
export function buildCalendarMap(habit: Habit, entries: Entry[]): CalendarDay[] {
  return computeDailyScores(habit, entries, {
    from: habit.created_at,
    to: habit.archived_at ?? new Date(),
  });
}
