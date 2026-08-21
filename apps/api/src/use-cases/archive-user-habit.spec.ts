import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { ArchiveUserHabitUseCase } from "./archive-user-habit";
import { HabitStatus } from "@/db/entities/habit.entity";
import { makeHabit } from "@/test/factories";

let habitsRepository: InMemoryHabitsRepository;
let sut: ArchiveUserHabitUseCase;

describe("Archive User Habit Use Case", () => {
  beforeEach(async () => {
    habitsRepository = new InMemoryHabitsRepository();
    sut = new ArchiveUserHabitUseCase(habitsRepository);
  });

  it("should be able to archived a habit", async () => {
    const habitInMemory = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    const habit = await sut.execute({
      userId: "user_01",
      habitId: habitInMemory.id,
    });

    expect(habit.data).toEqual(
      expect.objectContaining({ status: HabitStatus.ARCHIVED }),
    );
  });
});
