import type { HabitRepository } from "@/repositories/habit-repository";

interface DeleteUserHabitUseCaseRequest {
  userId: string;
  habitId: string;
}

type DeleteUserHabitUseCaseResponse =
  | { success: true }
  | { success: false; reason: "not_found" | "forbidden" };
export class DeleteUserHabitUseCase {
  constructor(private habitsRepository: HabitRepository) {}

  async execute({
    userId,
    habitId,
  }: DeleteUserHabitUseCaseRequest): Promise<DeleteUserHabitUseCaseResponse> {
    const habit = await this.habitsRepository.findById(habitId);

    if (!habit) {
      return { success: false, reason: "not_found" };
    }
    if (userId !== habit.user_id) {
      return { success: false, reason: "forbidden" };
    }

    await this.habitsRepository.delete(habitId);

    return { success: true };
  }
}
