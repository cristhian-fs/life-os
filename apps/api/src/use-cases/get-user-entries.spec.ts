import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { GetUserEntriesUseCase } from "./get-user-entries";

let entriesRepository: InMemoryEntryRepository;
let habitsRepository: InMemoryHabitsRepository;
let sut: GetUserEntriesUseCase;

describe("Get User Entries Use Case", () => {
  beforeEach(async () => {
    entriesRepository = new InMemoryEntryRepository();
    habitsRepository = new InMemoryHabitsRepository();
    sut = new GetUserEntriesUseCase(entriesRepository, habitsRepository);
  });

  it("should list entries for the habit within the date range", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: new Date("2026-01-10"),
      }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: new Date("2026-03-01"), // outside the range below
      }),
    );

    const result = await sut.execute({
      userId: "user_01",
      habitId: habit.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-31"),
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it("should not list entries for a habit that does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      habitId: "non-existing-id",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-31"),
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "habit_not_found",
    });
  });

  it("should not list entries for a habit that belongs to another user", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_02",
      habitId: habit.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-31"),
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "forbidden",
    });
  });
});
