import type { Habit } from "@/db/entities/habit.entity";
import { buildBestStreaks, type Streak } from "@/reports/build-best-streaks";
import type { EntryRepository } from "@/repositories/entry-repository";

interface BestStreaksResponse {
  streaks: Streak[];
}

export class BestStreaksUseCase {
  constructor(private entriesRepository: EntryRepository) {}

  async execute(habit: Habit): Promise<BestStreaksResponse> {
    const startDate = habit.created_at;
    const endDate = habit.archived_at ?? new Date();

    const entries = await this.entriesRepository.findByHabitAndDateRange(
      habit.id,
      {
        startDate,
        endDate,
      },
    );

    return buildBestStreaks(entries, habit, { startDate, endDate });
  }
}
