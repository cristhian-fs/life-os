import { describe, expect, it } from "vitest";
import { HabitType } from "@/db/entities/habit.entity";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { buildBestStreaks } from "./build-best-streaks";

// Jan 2026: 2=Fri, 3=Sat, 4=Sun, 5=Mon, 6=Tue, 7=Wed (ISO weekdays 5,6,7,1,2,3)
const day = (n: number) => new Date(`2026-01-${String(n).padStart(2, "0")}`);

describe("buildBestStreaks", () => {
  it("without active_weekdays, a missed weekend day breaks the streak as before", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN, active_weekdays: null }),
    );
    for (const n of [2, 5, 6]) {
      // Sat/Sun (3,4) intentionally left without entries
      await entriesRepository.create(
        makeEntry({ habit_id: habit.id, date: day(n), value_boolean: true }),
      );
    }

    const { streaks, currentStreak } = buildBestStreaks(
      entriesRepository.items,
      habit,
      { startDate: day(2), endDate: day(6) },
    );

    expect(streaks).toEqual([
      { from: day(5), to: day(6), streak_num: 2 },
      { from: day(2), to: day(2), streak_num: 1 },
    ]);
    expect(currentStreak).toEqual({
      from: day(5),
      to: day(6),
      streak_num: 2,
    });
  });

  it("skips inactive weekdays entirely, so a weekend gap no longer breaks the streak", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({
        type: HabitType.BOOLEAN,
        active_weekdays: [1, 2, 3, 4, 5], // Mon-Fri only
      }),
    );
    for (const n of [2, 5, 6]) {
      // Sat/Sun (3,4) are inactive weekdays, so no entry needed there
      await entriesRepository.create(
        makeEntry({ habit_id: habit.id, date: day(n), value_boolean: true }),
      );
    }

    const { streaks, currentStreak } = buildBestStreaks(
      entriesRepository.items,
      habit,
      { startDate: day(2), endDate: day(6) },
    );

    expect(streaks).toEqual([{ from: day(2), to: day(6), streak_num: 3 }]);
    expect(currentStreak).toEqual({
      from: day(2),
      to: day(6),
      streak_num: 3,
    });
  });

  it("a missed active weekday still breaks the streak even with active_weekdays set", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({
        type: HabitType.BOOLEAN,
        active_weekdays: [1, 2, 3, 4, 5], // Mon-Fri
      }),
    );
    // Mon (5) succeeds, Tue (6) is active but missed, Wed (7) succeeds
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(5), value_boolean: true }),
    );
    await entriesRepository.create(
      makeEntry({ habit_id: habit.id, date: day(7), value_boolean: true }),
    );

    const { streaks, currentStreak } = buildBestStreaks(
      entriesRepository.items,
      habit,
      { startDate: day(5), endDate: day(7) },
    );

    expect(streaks).toEqual([
      { from: day(5), to: day(5), streak_num: 1 },
      { from: day(7), to: day(7), streak_num: 1 },
    ]);
    expect(currentStreak).toEqual({ from: day(7), to: day(7), streak_num: 1 });
  });

  it("active_weekdays uses ISO-8601 numbering (Mon=1..Sun=7) — a habit restricted to Mon/Tue/Wed doesn't drop Monday", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN, active_weekdays: [1, 2, 3] }), // Mon, Tue, Wed
    );
    for (const n of [5, 6, 7]) {
      // real Mon, Tue, Wed — exactly the restricted days
      await entriesRepository.create(
        makeEntry({ habit_id: habit.id, date: day(n), value_boolean: true }),
      );
    }

    const { currentStreak } = buildBestStreaks(
      entriesRepository.items,
      habit,
      { startDate: day(5), endDate: day(7) },
    );

    expect(currentStreak).toEqual({
      from: day(5),
      to: day(7),
      streak_num: 3,
    });
  });

  it("a habit active on a single weekday streaks across consecutive occurrences of that weekday", async () => {
    const habitsRepository = new InMemoryHabitsRepository();
    const entriesRepository = new InMemoryEntryRepository();

    const habit = await habitsRepository.create(
      makeHabit({ type: HabitType.BOOLEAN, active_weekdays: [1] }), // Mondays only
    );
    // Jan 5 and Jan 12 2026 are both Mondays
    for (const n of [5, 12]) {
      await entriesRepository.create(
        makeEntry({ habit_id: habit.id, date: day(n), value_boolean: true }),
      );
    }

    const { streaks, currentStreak } = buildBestStreaks(
      entriesRepository.items,
      habit,
      { startDate: day(5), endDate: day(12) },
    );

    expect(streaks).toEqual([{ from: day(5), to: day(12), streak_num: 2 }]);
    expect(currentStreak).toEqual({
      from: day(5),
      to: day(12),
      streak_num: 2,
    });
  });
});
