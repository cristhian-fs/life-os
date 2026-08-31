import { HabitStatus } from "@/db/entities/habit.entity";
import { buildBestStreaks, type Streak } from "@/reports/build-best-streaks";
import { computeDailyScores } from "@/reports/build-score-history";
import { utcStartOfMonth, utcStartOfWeek } from "@/reports/date-buckets";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { HabitRepository } from "@/repositories/habit-repository";

interface HabitsProgressSummaryUseCaseRequest {
  userId: string;
}

interface HabitStreakSummary {
  habit_id: string;
  habit_name: string;
  streak: Streak | null;
}

interface HabitsProgressSummaryUseCaseResponse {
  streaks: HabitStreakSummary[];
  weekConclusionTax: number;
  monthConclusionTax: number;
}

// Accumulates habit-days across every active habit, weighting each day
// equally (not each habit) — a habit with more history contributes more days.
type ScoreAccumulator = { totalPercentage: number; dayCount: number };

function average({ totalPercentage, dayCount }: ScoreAccumulator): number {
  if (dayCount === 0) return 0;
  return totalPercentage / dayCount;
}

export class HabitsProgressSummaryUseCase {
  constructor(
    private habitsRepository: HabitRepository,
    private entriesRepository: EntryRepository,
  ) {}

  async execute({
    userId,
  }: HabitsProgressSummaryUseCaseRequest): Promise<HabitsProgressSummaryUseCaseResponse> {
    const activeHabits = (
      await this.habitsRepository.findManyByUserId(userId)
    ).filter((habit) => habit.status === HabitStatus.ACTIVE);

    const now = new Date();
    const weekStart = utcStartOfWeek(now);
    const monthStart = utcStartOfMonth(now);

    const streaks: HabitStreakSummary[] = [];
    const week: ScoreAccumulator = { totalPercentage: 0, dayCount: 0 };
    const month: ScoreAccumulator = { totalPercentage: 0, dayCount: 0 };

    for (const habit of activeHabits) {
      const entries = await this.entriesRepository.findByHabitAndDateRange(
        habit.id,
        { startDate: habit.created_at, endDate: now },
      );

      const { currentStreak } = buildBestStreaks(entries, habit, {
        startDate: habit.created_at,
        endDate: now,
      });
      streaks.push({
        habit_id: habit.id,
        habit_name: habit.name,
        streak: currentStreak,
      });

      const weekFrom =
        habit.created_at > weekStart ? habit.created_at : weekStart;
      for (const point of computeDailyScores(habit, entries, {
        from: weekFrom,
        to: now,
      })) {
        week.totalPercentage += point.percentage;
        week.dayCount += 1;
      }

      const monthFrom =
        habit.created_at > monthStart ? habit.created_at : monthStart;
      for (const point of computeDailyScores(habit, entries, {
        from: monthFrom,
        to: now,
      })) {
        month.totalPercentage += point.percentage;
        month.dayCount += 1;
      }
    }

    return {
      streaks,
      weekConclusionTax: average(week),
      monthConclusionTax: average(month),
    };
  }
}
