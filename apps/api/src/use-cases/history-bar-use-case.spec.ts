import { beforeEach, describe, expect, it } from "vitest";
import { HabitType } from "@/db/entities/habit.entity";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { HistoryBarUseCase } from "./history-bar-use-case";

let entriesRepository: InMemoryEntryRepository;
let habitsRepository: InMemoryHabitsRepository;
let sut: HistoryBarUseCase;

describe("History Bar Use Case", () => {
  beforeEach(async () => {
    entriesRepository = new InMemoryEntryRepository();
    habitsRepository = new InMemoryHabitsRepository();
    sut = new HistoryBarUseCase(habitsRepository, entriesRepository);
  });

  it("delegates to buildHistoryBar over the habit's created_at..archived_at range", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    habit.created_at = new Date("2026-01-01");
    habit.archived_at = new Date("2026-01-03");

    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: new Date("2026-01-01"),
        value_boolean: true,
      }),
    );

    const result = await sut.execute({
      userId: "user_01",
      habitId: habit.id,
      period: "all", // "all" buckets by month, so the 3-day range collapses to one point
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    // only Jan 1 was accomplished
    expect(result.data).toEqual([{ date: new Date("2026-01-01"), count: 1 }]);
  });

  it("does not return data for a habit that does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      habitId: "non-existing-id",
      period: "all",
    });

    expect(result).toEqual({ success: false, reason: "not_found" });
  });

  it("does not return data for a habit that belongs to another user", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_02",
      habitId: habit.id,
      period: "all",
    });

    expect(result).toEqual({ success: false, reason: "forbidden" });
  });
});
