import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HabitStatus, HabitType } from "@/db/entities/habit.entity";
import { diffInUTCDays, utcStartOfMonth } from "@/reports/date-buckets";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { HabitsProgressSummaryUseCase } from "./habits-progress-summary-use-case";

let habitsRepository: InMemoryHabitsRepository;
let entriesRepository: InMemoryEntryRepository;
let sut: HabitsProgressSummaryUseCase;

// Wednesday — a day that's in the middle of both its week and month, so
// clamping logic has room to matter.
const NOW = new Date("2026-01-14T00:00:00.000Z");

describe("Habits Progress Summary Use Case", () => {
  beforeEach(() => {
    habitsRepository = new InMemoryHabitsRepository();
    entriesRepository = new InMemoryEntryRepository();
    sut = new HabitsProgressSummaryUseCase(habitsRepository, entriesRepository);
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports the streak still open today, and null when today broke it", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    habit.created_at = new Date("2026-01-01T00:00:00.000Z");
    await habitsRepository.save(habit);
    // successful every day up to and including today
    for (let day = 10; day <= 14; day++) {
      await entriesRepository.create(
        makeEntry({
          user_id: "user_01",
          habit_id: habit.id,
          date: new Date(`2026-01-${day}T00:00:00.000Z`),
          value_boolean: true,
        }),
      );
    }

    const { streaks } = await sut.execute({ userId: "user_01" });

    expect(streaks).toEqual([
      {
        habit_id: habit.id,
        habit_name: habit.name,
        streak: {
          from: new Date("2026-01-10T00:00:00.000Z"),
          to: NOW,
          streak_num: 5,
        },
      },
    ]);
  });

  it("returns a null current streak when today has no successful entry", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    habit.created_at = new Date("2026-01-01T00:00:00.000Z");
    await habitsRepository.save(habit);
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: new Date("2026-01-10T00:00:00.000Z"),
        value_boolean: true,
      }),
    );
    // 2026-01-14 (today) intentionally left without an entry

    const { streaks } = await sut.execute({ userId: "user_01" });

    expect(streaks[0].streak).toBeNull();
  });

  it("scores 100% completion when every day this month has a successful entry", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    habit.created_at = new Date("2025-06-01T00:00:00.000Z"); // well before this month
    await habitsRepository.save(habit);

    const monthStart = utcStartOfMonth(NOW);
    const daysThisMonthSoFar = diffInUTCDays(monthStart, NOW) + 1;
    for (let i = 0; i < daysThisMonthSoFar; i++) {
      const date = new Date(monthStart);
      date.setUTCDate(date.getUTCDate() + i);
      await entriesRepository.create(
        makeEntry({
          user_id: "user_01",
          habit_id: habit.id,
          date,
          value_boolean: true,
        }),
      );
    }

    const { weekConclusionTax, monthConclusionTax } = await sut.execute({
      userId: "user_01",
    });

    expect(weekConclusionTax).toBe(100);
    expect(monthConclusionTax).toBe(100);
  });

  it("clamps the scored range to the habit's creation date", async () => {
    // created today — only today counts, and it's a success, so 100%
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    habit.created_at = NOW;
    await habitsRepository.save(habit);
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: NOW,
        value_boolean: true,
      }),
    );

    const { monthConclusionTax } = await sut.execute({ userId: "user_01" });

    expect(monthConclusionTax).toBe(100);
  });

  it("excludes archived habits from streaks and conclusion tax", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    habit.status = HabitStatus.ARCHIVED;
    await habitsRepository.save(habit);

    const result = await sut.execute({ userId: "user_01" });

    expect(result.streaks).toEqual([]);
    expect(result.weekConclusionTax).toBe(0);
    expect(result.monthConclusionTax).toBe(0);
  });
});
