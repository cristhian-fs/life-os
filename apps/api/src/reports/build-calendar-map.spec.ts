import { describe, expect, it } from "vitest";
import { HabitType } from "@/db/entities/habit.entity";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { buildCalendarMap } from "./build-calendar-map";

const day = (n: number) => new Date(`2026-01-${String(n).padStart(2, "0")}`);

describe("buildCalendarMap", () => {
  it("returns one point per day across the full habit lifetime, never bucketed", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN }),
    );
    habit.created_at = day(1);
    habit.archived_at = day(3);

    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(1), value_boolean: true }),
    );
    // day 2 intentionally left without an entry
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(3), value_boolean: true }),
    );

    const days = buildCalendarMap(habit, entriesRepository.items);

    expect(days).toEqual([
      { date: day(1), percentage: 100 },
      { date: day(2), percentage: 0 },
      { date: day(3), percentage: 100 },
    ]);
  });

  it("runs through today when the habit is still active (no archived_at)", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN }),
    );
    const twoDaysAgo = new Date();
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);
    twoDaysAgo.setUTCHours(0, 0, 0, 0);
    habit.created_at = twoDaysAgo;
    habit.archived_at = null;

    const days = buildCalendarMap(habit, entriesRepository.items);

    expect(days).toHaveLength(3); // twoDaysAgo, yesterday, today
    expect(days.every((point) => point.percentage === 0)).toBe(true);
  });
});
