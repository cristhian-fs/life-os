import { HabitStatus, type Habit } from "@/db/entities/habit.entity";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { HabitRepository } from "@/repositories/habit-repository";

interface HabitsTodayUseCaseRequest {
  userId: string;
}

interface HabitsTodayUseCaseResponse {
  habits: Habit[];
}

export class HabitsTodayUseCase {
  constructor(
    private habitsRepository: HabitRepository,
    private entriesRepository: EntryRepository,
  ) {}

  async execute({
    userId,
  }: HabitsTodayUseCaseRequest): Promise<HabitsTodayUseCaseResponse> {
    const activeHabits = (
      await this.habitsRepository.findManyByUserId(userId)
    ).filter((habit) => habit.status === HabitStatus.ACTIVE);

    if (!activeHabits.length) return { habits: [] };

    const entriesToday = await this.entriesRepository.findManyByIdsAndDate(
      activeHabits.map((habit) => habit.id),
      new Date(),
    );
    const habitIdsWithEntryToday = new Set(
      entriesToday.map((entry) => entry.habit_id),
    );

    return {
      habits: activeHabits.filter(
        (habit) => !habitIdsWithEntryToday.has(habit.id),
      ),
    };
  }
}
