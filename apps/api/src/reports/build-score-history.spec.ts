import { describe, expect, it } from "vitest";
import { HabitType } from "@/db/entities/habit.entity";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { buildScoreHistory } from "./build-score-history";

const day = (n: number) => new Date(`2026-01-${String(n).padStart(2, "0")}`);

describe("buildScoreHistory", () => {
  it("buckets by day and scores a missing day as 0%", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(1), value_boolean: true }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(3), value_boolean: true }),
    );
    // day 2 intentionally left without an entry

    const points = buildScoreHistory(habit, entriesRepository.items, "week", {
      from: day(1),
      to: day(3),
    });

    expect(points).toEqual([
      { date: day(1), percentage: 100 },
      { date: day(2), percentage: 0 },
      { date: day(3), percentage: 100 },
    ]);
  });

  it("scores a numeric entry as a percentage of the goal, capped at 100", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.NUMERIC, goal_value: 100 }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(1), value_numeric: 50 }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(2), value_numeric: 150 }),
    );

    const points = buildScoreHistory(habit, entriesRepository.items, "month", {
      from: day(1),
      to: day(2),
    });

    expect(points).toEqual([
      { date: day(1), percentage: 50 },
      { date: day(2), percentage: 100 },
    ]);
  });

  it("buckets by week and averages the daily scores within each bucket", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN }),
    );
    // Jan 5 2026 is a Monday: week 1 = Jan 5-11, week 2 starts Jan 12
    for (const n of [5, 6, 7, 8, 12]) {
      await entriesRepository.create(
        makeEntry({ habit_id: habit.id, date: day(n), value_boolean: true }),
      );
    }

    const points = buildScoreHistory(
      habit,
      entriesRepository.items,
      "3months",
      { from: day(5), to: day(13) },
    );

    // week 1: 4 successes / 7 days -> round(400/7) = 57
    // week 2 (partial, Jan 12-13): 1 success / 2 days -> 50
    expect(points).toEqual([
      { date: day(5), percentage: 57 },
      { date: day(12), percentage: 50 },
    ]);
  });
});
