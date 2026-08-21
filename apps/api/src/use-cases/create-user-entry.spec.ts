import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { CreateUserEntryUseCase } from "./create-user-entry";

let entriesRepository: InMemoryEntryRepository;
let habitsRepository: InMemoryHabitsRepository;
let sut: CreateUserEntryUseCase;

describe("Create User Entry Use Case", () => {
  beforeEach(async () => {
    entriesRepository = new InMemoryEntryRepository();
    habitsRepository = new InMemoryHabitsRepository();
    sut = new CreateUserEntryUseCase(entriesRepository, habitsRepository);
  });

  it("should be able to create an entry for the user's own habit", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const { user_id: _userId, habit_id: _habitId, ...rest } = makeEntry();

    const result = await sut.execute({
      userId: "user_01",
      payload: { ...rest, habit_id: habit.id },
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(
      expect.objectContaining({ user_id: "user_01", habit_id: habit.id }),
    );
  });

  it("should not create an entry for a habit that does not exist", async () => {
    const { user_id: _userId, ...payload } = makeEntry({
      habit_id: "non-existing-id",
    });

    const result = await sut.execute({ userId: "user_01", payload });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "habit_not_found",
    });
  });

  it("should not create an entry for a habit that belongs to another user", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    const { user_id: _userId, ...payload } = makeEntry({
      habit_id: habit.id,
    });

    const result = await sut.execute({ userId: "user_02", payload });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "forbidden",
    });
  });
});
