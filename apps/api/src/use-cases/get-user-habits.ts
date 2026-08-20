import type { Habit } from "@/db/entities/habit.entity";
import type { HabitRepository } from "@/repositories/habit-repository";

interface GetUserHabitsUseCaseRequest {
  userId: string;
}

interface GetUserHabitsUseCaseResponse {
  habits: Habit[];
}

export class GetUserHabitsUseCase {
  constructor(private habitsRepository: HabitRepository) {}

  async execute({
    userId,
  }: GetUserHabitsUseCaseRequest): Promise<GetUserHabitsUseCaseResponse> {
    const habits = await this.habitsRepository.findManyByUserId(userId);

    return {
      habits,
    };
  }
}
