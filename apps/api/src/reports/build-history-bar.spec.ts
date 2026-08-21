import { describe, expect, it } from "vitest";
import { HabitType } from "@/db/entities/habit.entity";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { buildHistoryBar } from "./build-history-bar";

const day = (n: number) => new Date(`2026-01-${String(n).padStart(2, "0")}`);

describe("buildHistoryBar", () => {
  it("buckets by day and counts a missed day as 0", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(1), value_boolean: true }),
    );
    // day 2 intentionally left without an entry

    const points = buildHistoryBar(habit, entriesRepository.items, "week", {
      from: day(1),
      to: day(2),
    });

    expect(points).toEqual([
      { date: day(1), count: 1 },
      { date: day(2), count: 0 },
    ]);
  });

  it("only counts a numeric entry when it meets the goal, not just having a value", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.NUMERIC, goal_value: 2000 }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(1), value_numeric: 2000 }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(2), value_numeric: 1999 }),
    );

    const points = buildHistoryBar(habit, entriesRepository.items, "month", {
      from: day(1),
      to: day(2),
    });

    expect(points).toEqual([
      { date: day(1), count: 1 },
      { date: day(2), count: 0 },
    ]);
  });

  it("buckets by week and sums the accomplished days within each bucket", async () => {
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

    const points = buildHistoryBar(
      habit,
      entriesRepository.items,
      "3months",
      { from: day(5), to: day(13) },
    );

    expect(points).toEqual([
      { date: day(5), count: 4 }, // week 1: Jan 5,6,7,8 accomplished
      { date: day(12), count: 1 }, // week 2 (partial, Jan 12-13): Jan 12 accomplished
    ]);
  });
});
