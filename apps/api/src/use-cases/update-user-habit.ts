import type { Habit } from "@/db/entities/habit.entity";
import type { HabitRepository } from "@/repositories/habit-repository";
import type { UpdateHabitInput } from "@/schemas/habits.schema";

interface UpdateUserHabitUseCaseRequest {
  userId: string;
  habitId: string;
  payload: UpdateHabitInput;
}

interface UpdateUserHabitUseCaseResponse {
  habit: Habit | null;
}

export class UpdateUserHabitUseCase {
  constructor(private habitsRepository: HabitRepository) {}

  async execute({
    userId,
    habitId,
    payload,
  }: UpdateUserHabitUseCaseRequest): Promise<UpdateUserHabitUseCaseResponse> {
    const habit = await this.habitsRepository.findById(habitId);

    if (!habit || habit.user_id !== userId) {
      return { habit: null };
    }

    const updated = await this.habitsRepository.save({ ...habit, ...payload });

    return { habit: updated };
  }
}
