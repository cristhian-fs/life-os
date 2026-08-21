import { buildScoreHistory, type ScorePoint } from "@/reports/build-score-history";
import { resolveDateRange, type Period } from "@/lib/utils";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { HabitRepository } from "@/repositories/habit-repository";

interface ScoreHistoryProps {
  userId: string;
  habitId: string;
  period: Period;
}

type ScoreHistoryResponse =
  | { success: true; data: ScorePoint[] }
  | { success: false; reason: "not_found" | "forbidden" };

export class ScoreHistoryUseCase {
  constructor(
    private habitsRepository: HabitRepository,
    private entriesRepository: EntryRepository,
  ) {}

  async execute({
    userId,
    habitId,
    period,
  }: ScoreHistoryProps): Promise<ScoreHistoryResponse> {
    const habit = await this.habitsRepository.findById(habitId);

    if (!habit) return { success: false, reason: "not_found" as const };
    if (habit.user_id !== userId)
      return { success: false, reason: "forbidden" as const };

    const { from, to } = resolveDateRange(period, habit);
    const habitEntries = await this.entriesRepository.findByHabitAndDateRange(
      habitId,
      { startDate: from, endDate: to },
    );

    return {
      success: true,
      data: buildScoreHistory(habit, habitEntries, period, { from, to }),
    };
  }
}
