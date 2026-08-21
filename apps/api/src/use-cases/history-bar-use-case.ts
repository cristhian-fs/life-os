import { buildHistoryBar, type HistoryBarPoint } from "@/reports/build-history-bar";
import { resolveDateRange, type Period } from "@/lib/utils";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { HabitRepository } from "@/repositories/habit-repository";

interface HistoryBarUseCaseRequest {
  userId: string;
  habitId: string;
  period: Period;
}

type HistoryBarUseCaseResponse =
  | { success: true; data: HistoryBarPoint[] }
  | { success: false; reason: "not_found" | "forbidden" };

export class HistoryBarUseCase {
  constructor(
    private habitsRepository: HabitRepository,
    private entriesRepository: EntryRepository,
  ) {}

  async execute({
    userId,
    habitId,
    period,
  }: HistoryBarUseCaseRequest): Promise<HistoryBarUseCaseResponse> {
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
      data: buildHistoryBar(habit, habitEntries, period, { from, to }),
    };
  }
}
