import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { DeleteUserHabitUseCase } from "./delete-user-habit";
import { makeHabit } from "@/test/factories";

let habitsRepository: InMemoryHabitsRepository;
let sut: DeleteUserHabitUseCase;

describe("Delete User Habit Use Case", () => {
  beforeEach(async () => {
    habitsRepository = new InMemoryHabitsRepository();
    sut = new DeleteUserHabitUseCase(habitsRepository);
  });

  it("should be able to delete an user habit", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const { success } = await sut.execute({
      userId: "user_01",
      habitId: habit.id,
    });

    expect(success).toBeTruthy();
  });

  it("should not delete a habit that belongs to another user", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const { success } = await sut.execute({
      userId: "user_02",
      habitId: habit.id,
    });

    expect(success).toBeFalsy();
  });

  it("should return null when the habit does not exist", async () => {
    const { success } = await sut.execute({
      userId: "user_01",
      habitId: "non-existing-id",
    });

    expect(success).toBeFalsy();
  });
});
