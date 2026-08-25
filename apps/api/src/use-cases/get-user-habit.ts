import type { Habit } from "@/db/entities/habit.entity";
import type { HabitRepository } from "@/repositories/habit-repository";

interface GetUserHabitUseCaseRequest {
  userId: string;
  habitId: string;
}

type GetUserHabitUseCaseResponse =
  | { success: true; data: Habit }
  | { success: false; data: null; reason: "not_found" | "forbidden" };

export class GetUserHabitUseCase {
  constructor(private habitsRepository: HabitRepository) {}

  async execute({
    userId,
    habitId,
  }: GetUserHabitUseCaseRequest): Promise<GetUserHabitUseCaseResponse> {
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

    return { success: true, data: habit };
  }
}
