import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { GetUserHabitsUseCase } from "./get-user-habits";
import { HabitGoalPeriod, HabitType } from "@/db/entities/habit.entity";

let habitsRepository: InMemoryHabitsRepository;
let sut: GetUserHabitsUseCase;

describe("Get User Habits Use Case", () => {
  beforeEach(async () => {
    habitsRepository = new InMemoryHabitsRepository();
    sut = new GetUserHabitsUseCase(habitsRepository);
  });

  it("should be able to get an user habits", async () => {
    Array.from({ length: 2 }).map(async (_, i) => {
      await habitsRepository.create({
        user_id: "user_01",
        name: `Habit ${i + 1}`,
        goal_period: HabitGoalPeriod.DAILY,
        type: HabitType.BOOLEAN,
      });
    });

    const habits = await habitsRepository.findManyByUserId("user_01");

    expect(habits).toHaveLength(2);
    expect(habits).toEqual([
      expect.objectContaining({ name: "Habit 1" }),
      expect.objectContaining({ name: "Habit 2" }),
    ]);
  });
});
