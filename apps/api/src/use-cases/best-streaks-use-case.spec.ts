import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { HabitType } from "@/db/entities/habit.entity";
import { BestStreaksUseCase } from "./best-streaks-use-case";

let entriesRepository: InMemoryEntryRepository;
let habitsRepository: InMemoryHabitsRepository;
let sut: BestStreaksUseCase;

const day = (n: number) => new Date(`2026-01-${String(n).padStart(2, "0")}`);

describe("Best Streaks Use Case", () => {
  beforeEach(async () => {
    entriesRepository = new InMemoryEntryRepository();
    habitsRepository = new InMemoryHabitsRepository();
    sut = new BestStreaksUseCase(entriesRepository);
  });

  it("finds the longest streak and ranks streaks longest-first, breaking on missed/failed days", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    // pin the report window so the test doesn't depend on "now"
    habit.created_at = day(1);
    habit.archived_at = day(10);

    // streak A: Jan 1-2 (2 days), broken by a failed entry on Jan 3
    // streak B: Jan 4-7 (4 days) — the longest, broken by a missing entry on Jan 8
    // streak C: Jan 9-10 (2 days), runs to the end of the range
    const successDays = [1, 2, 4, 5, 6, 7, 9, 10];
    for (const n of successDays) {
      await entriesRepository.create(
        makeEntry({
          user_id: "user_01",
          habit_id: habit.id,
          date: day(n),
          value_boolean: true,
        }),
      );
    }
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: day(3),
        value_boolean: false,
      }),
    );
    // Jan 8 intentionally left without an entry

    const { streaks } = await sut.execute(habit);

    expect(streaks).toEqual([
      { from: day(4), to: day(7), streak_num: 4 },
      { from: day(1), to: day(2), streak_num: 2 },
      { from: day(9), to: day(10), streak_num: 2 },
    ]);
  });

  it("counts a numeric entry as success only when it meets the goal", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.NUMERIC, goal_value: 2000 }),
    );
    habit.created_at = day(1);
    habit.archived_at = day(3);

    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: day(1),
        value_numeric: 2000, // meets goal exactly
      }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: day(2),
        value_numeric: 1999, // below goal
      }),
    );

    const { streaks } = await sut.execute(habit);

    expect(streaks).toEqual([{ from: day(1), to: day(1), streak_num: 1 }]);
  });
});
