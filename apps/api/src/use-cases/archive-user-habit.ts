import { HabitStatus, type Habit } from "@/db/entities/habit.entity";
import type { HabitRepository } from "@/repositories/habit-repository";

interface ArchiveUserHabitUseCaseRequest {
  userId: string;
  habitId: string;
}

type ArchiveUserHabitUseCaseResponse =
  | { success: true; data: Habit }
  | { success: false; data: null; reason: "not_found" | "forbidden" };

export class ArchiveUserHabitUseCase {
  constructor(private habitsRepository: HabitRepository) {}

  async execute({
    userId,
    habitId,
  }: ArchiveUserHabitUseCaseRequest): Promise<ArchiveUserHabitUseCaseResponse> {
    const habit = await this.habitsRepository.findById(habitId);

    if (!habit) {
      return {
        success: false,
        data: null,
        reason: "not_found",
      };
    }
    if (habit.user_id !== userId) {
      return {
        success: false,
        data: null,
        reason: "forbidden",
      };
    }

		habit.status = HabitStatus.ARCHIVED
		habit.archived_at = new Date();

		const updated = await this.habitsRepository.save(habit);
    return { success: true, data: updated };
  }
}
