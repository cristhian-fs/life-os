import { buildCalendarMap, type CalendarDay } from "@/reports/build-calendar-map";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { HabitRepository } from "@/repositories/habit-repository";

interface CalendarMapUseCaseRequest {
  userId: string;
  habitId: string;
}

type CalendarMapResponse =
  | { success: true; data: CalendarDay[] }
  | { success: false; reason: "not_found" | "forbidden" };

export class CalendarMapUseCase {
  constructor(
    private habitsRepository: HabitRepository,
    private entriesRepository: EntryRepository,
  ) {}

  async execute({
    userId,
    habitId,
  }: CalendarMapUseCaseRequest): Promise<CalendarMapResponse> {
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

    return { success: true, data: buildCalendarMap(habit, entries) };
  }
}
