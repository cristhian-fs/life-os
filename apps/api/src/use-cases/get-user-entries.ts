import type { Entry } from "@/db/entities/entry.entity";
import type { HabitRepository } from "@/repositories/habit-repository";
import type { EntryRepository } from "@/repositories/entry-repository";

interface GetUserEntriesUseCaseRequest {
  userId: string;
  habitId: string;
  startDate: Date;
  endDate: Date;
}

type GetUserEntriesUseCaseResponse =
  | { success: true; data: Entry[] }
  | { success: false; data: null; reason: "habit_not_found" | "forbidden" };

export class GetUserEntriesUseCase {
  constructor(
    private entriesRepository: EntryRepository,
    private habitsRepository: HabitRepository,
  ) {}

  async execute({
    userId,
    habitId,
    startDate,
    endDate,
  }: GetUserEntriesUseCaseRequest): Promise<GetUserEntriesUseCaseResponse> {
    const habit = await this.habitsRepository.findById(habitId);

    if (!habit) {
      return { success: false, data: null, reason: "habit_not_found" };
    }
    if (habit.user_id !== userId) {
      return { success: false, data: null, reason: "forbidden" };
    }

    const entries = await this.entriesRepository.findByHabitAndDateRange(
      habitId,
      { userId, startDate, endDate },
    );

    return { success: true, data: entries };
  }
}
