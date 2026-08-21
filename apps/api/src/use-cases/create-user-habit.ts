import type { Habit } from "@/db/entities/habit.entity";
import type {
  CreateHabitInput,
  HabitRepository,
} from "@/repositories/habit-repository";

interface CreateUserHabitUseCaseRequest {
  userId: string;
  payload: Omit<CreateHabitInput, "user_id">;
}

interface CreateUserHabitUseCaseResponse {
  habit: Habit;
}

export class CreateUserHabitUseCase {
  constructor(private habitsRepository: HabitRepository) {}

  async execute({
    userId,
    payload,
  }: CreateUserHabitUseCaseRequest): Promise<CreateUserHabitUseCaseResponse> {
    const habit = await this.habitsRepository.create({
      ...payload,
      user_id: userId,
    });

    return { habit };
  }
}
