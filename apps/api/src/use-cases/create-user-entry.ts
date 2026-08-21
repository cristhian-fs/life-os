import type { Entry } from "@/db/entities/entry.entity";
import type { HabitRepository } from "@/repositories/habit-repository";
import type {
  CreateEntryInput,
  EntryRepository,
} from "@/repositories/entry-repository";

interface CreateUserEntryUseCaseRequest {
  userId: string;
  payload: Omit<CreateEntryInput, "user_id">;
}

type CreateUserEntryUseCaseResponse =
  | { success: true; data: Entry }
  | { success: false; data: null; reason: "habit_not_found" | "forbidden" };

export class CreateUserEntryUseCase {
  constructor(
    private entriesRepository: EntryRepository,
    private habitsRepository: HabitRepository,
  ) {}

  async execute({
    userId,
    payload,
  }: CreateUserEntryUseCaseRequest): Promise<CreateUserEntryUseCaseResponse> {
    const habit = await this.habitsRepository.findById(payload.habit_id);

    if (!habit) {
      return { success: false, data: null, reason: "habit_not_found" };
    }
    if (habit.user_id !== userId) {
      return { success: false, data: null, reason: "forbidden" };
    }

    const entry = await this.entriesRepository.create({
      ...payload,
      user_id: userId,
    });

    return { success: true, data: entry };
  }
}
