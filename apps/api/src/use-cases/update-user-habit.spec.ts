import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { UpdateUserHabitUseCase } from "./update-user-habit";
import { makeHabit } from "@/test/factories";

let habitsRepository: InMemoryHabitsRepository;
let sut: UpdateUserHabitUseCase;

describe("Update User Habit Use Case", () => {
  beforeEach(async () => {
    habitsRepository = new InMemoryHabitsRepository();
    sut = new UpdateUserHabitUseCase(habitsRepository);
  });

  it("should be able to update an user habit", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const { habit: updated } = await sut.execute({
      userId: "user_01",
      habitId: habit.id,
      payload: { name: "Drink more water", goal_value: 2000 },
    });

    expect(updated).toEqual(
      expect.objectContaining({ name: "Drink more water", goal_value: 2000 }),
    );
  });

  it("should not update a habit that belongs to another user", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const { habit: updated } = await sut.execute({
      userId: "user_02",
      habitId: habit.id,
      payload: { name: "Hijacked" },
    });

    expect(updated).toBeNull();
  });

  it("should return null when the habit does not exist", async () => {
    const { habit } = await sut.execute({
      userId: "user_01",
      habitId: "non-existing-id",
      payload: { name: "Anything" },
    });

    expect(habit).toBeNull();
  });
});
