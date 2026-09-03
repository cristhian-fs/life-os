import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { CreateUserHabitUseCase } from "./create-user-habit";
import { HabitGoalPeriod, HabitType } from "@/db/entities/habit.entity";

let habitsRepository: InMemoryHabitsRepository;
let sut: CreateUserHabitUseCase;

describe("Create User Habit Use Case", () => {
  beforeEach(async () => {
    habitsRepository = new InMemoryHabitsRepository();
    sut = new CreateUserHabitUseCase(habitsRepository);
  });

  it("should be able to create a habit", async () => {
    const { habit } = await sut.execute({
      userId: "user_01",
      payload: {
        name: "Drink water",
        goal_value: 2000,
        goal_period: HabitGoalPeriod.DAILY,
        type: HabitType.NUMERIC,
        unit: "ml",
        description: "Drink water description",
        active_weekdays: null,
      },
    });

    expect(habit).toEqual(
      expect.objectContaining({ name: "Drink water", goal_value: 2000 }),
    );

    const habitInMemory = await habitsRepository.findById(habit.id);

    expect(habitInMemory).toEqual(
      expect.objectContaining({ name: "Drink water", goal_value: 2000 }),
    );
  });
});
