import { buildBestStreaks, type Streak } from "@/reports/build-best-streaks";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { HabitRepository } from "@/repositories/habit-repository";

interface BestStreaksUseCaseRequest {
  userId: string;
  habitId: string;
}

type BestStreaksResponse =
  | {
      success: true;
      data: Streak[];
    }
  | { success: false; reason: "not_found" | "forbidden" };

export class BestStreaksUseCase {
  constructor(
    private habitsRepository: HabitRepository,
    private entriesRepository: EntryRepository,
  ) {}

  async execute({
    userId,
    habitId,
  }: BestStreaksUseCaseRequest): Promise<BestStreaksResponse> {
    const habit = await this.habitsRepository.findById(habitId);

    if (!habit) return { success: false, reason: "not_found" as const };
    if (habit.user_id !== userId)
      return { success: false, reason: "forbidden" as const };

    const startDate = habit.created_at;
    const endDate = habit.archived_at ?? new Date();
    const entries = await this.entriesRepository.findByHabitAndDateRange(
      habit.id,
      { startDate, endDate },
    );

    return {
      success: true,
      data: buildBestStreaks(entries, habit, { startDate, endDate }).streaks,
    };
  }
}
