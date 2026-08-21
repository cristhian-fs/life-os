import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { HabitType } from "@/db/entities/habit.entity";
import { CalendarMapUseCase } from "./calendar-map-use-case";

let entriesRepository: InMemoryEntryRepository;
let habitsRepository: InMemoryHabitsRepository;
let sut: CalendarMapUseCase;

const day = (n: number) => new Date(`2026-01-${String(n).padStart(2, "0")}`);

describe("Calendar Map Use Case", () => {
  beforeEach(async () => {
    entriesRepository = new InMemoryEntryRepository();
    habitsRepository = new InMemoryHabitsRepository();
    sut = new CalendarMapUseCase(habitsRepository, entriesRepository);
  });

  it("returns one point per day across the habit's full lifetime", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    habit.created_at = day(1);
    habit.archived_at = day(3);

    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: day(2),
        value_boolean: true,
      }),
    );

    const result = await sut.execute({ userId: "user_01", habitId: habit.id });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual([
      { date: day(1), percentage: 0 },
      { date: day(2), percentage: 100 },
      { date: day(3), percentage: 0 },
    ]);
  });

  it("does not return data for a habit that does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      habitId: "non-existing-id",
    });

    expect(result).toEqual({ success: false, reason: "not_found" });
  });

  it("does not return data for a habit that belongs to another user", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const result = await sut.execute({ userId: "user_02", habitId: habit.id });

    expect(result).toEqual({ success: false, reason: "forbidden" });
  });
});
