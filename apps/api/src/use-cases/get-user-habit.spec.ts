import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { GetUserHabitUseCase } from "./get-user-habit";
import { makeHabit } from "@/test/factories";

let habitsRepository: InMemoryHabitsRepository;
let sut: GetUserHabitUseCase;

describe("Get User Habit Use Case", () => {
  beforeEach(async () => {
    habitsRepository = new InMemoryHabitsRepository();
    sut = new GetUserHabitUseCase(habitsRepository);
  });

  it("should be able to get a habit by id", async () => {
    const habitInMemory = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_01",
      habitId: habitInMemory.id,
    });

    expect(result).toEqual(
      expect.objectContaining({ success: true, data: habitInMemory }),
    );
  });

  it("should return not_found for a habit that does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      habitId: "non-existent-id",
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "not_found",
    });
  });

  it("should return forbidden for a habit that belongs to another user", async () => {
    const habitInMemory = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_02",
      habitId: habitInMemory.id,
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "forbidden",
    });
  });
});
