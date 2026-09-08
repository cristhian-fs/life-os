import { HabitStatus, type Habit } from "@/db/entities/habit.entity";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { HabitRepository } from "@/repositories/habit-repository";
import { isSuccess } from "@/reports/build-best-streaks";

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
    const entryTodayByHabitId = new Map(
      entriesToday.map((entry) => [entry.habit_id, entry]),
    );

    // "Missing today" = no entry yet, or an entry that hasn't hit the goal
    // (e.g. 5 of 8 glasses of water) — partial progress still needs finishing.
    return {
      habits: activeHabits.filter((habit) => {
        const entry = entryTodayByHabitId.get(habit.id);
        return !entry || !isSuccess(entry, habit);
      }),
    };
  }
}
