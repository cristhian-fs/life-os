import { beforeEach, describe, expect, it } from "vitest";
import { HabitStatus, HabitType } from "@/db/entities/habit.entity";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { InMemoryHabitsRepository } from "@/repositories/in-memory/in-memory-habit-repository";
import { makeEntry, makeHabit } from "@/test/factories";
import { HabitsTodayUseCase } from "./habits-today-use-case";

let habitsRepository: InMemoryHabitsRepository;
let entriesRepository: InMemoryEntryRepository;
let sut: HabitsTodayUseCase;

describe("Habits Today Use Case", () => {
  beforeEach(() => {
    habitsRepository = new InMemoryHabitsRepository();
    entriesRepository = new InMemoryEntryRepository();
    sut = new HabitsTodayUseCase(habitsRepository, entriesRepository);
  });

  it("returns active habits that have no entry today", async () => {
    const withEntry = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.BOOLEAN }),
    );
    const withoutEntry = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: withEntry.id,
        date: new Date(),
        value_boolean: true,
      }),
    );

    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toHaveLength(1);
    expect(habits[0].id).toBe(withoutEntry.id);
  });

  it("still returns a numeric habit whose entry today falls short of the goal", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.NUMERIC, goal_value: 8 }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: new Date(),
        value_numeric: 5,
      }),
    );

    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toHaveLength(1);
    expect(habits[0].id).toBe(habit.id);
  });

  it("excludes a numeric habit once today's entry meets the goal", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01", type: HabitType.NUMERIC, goal_value: 8 }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: new Date(),
        value_numeric: 8,
      }),
    );

    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toEqual([]);
  });

  it("excludes archived habits", async () => {
    const archived = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    archived.status = HabitStatus.ARCHIVED;
    await habitsRepository.save(archived);

    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toEqual([]);
  });

  it("ignores an entry logged on a different day", async () => {
    const habit = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: habit.id,
        date: new Date("2020-01-01"),
      }),
    );

    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toHaveLength(1);
    expect(habits[0].id).toBe(habit.id);
  });

  it("does not return habits belonging to another user", async () => {
    await habitsRepository.create(makeHabit({ user_id: "user_02" }));

    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toEqual([]);
  });

  it("returns an empty list when the user has no habits", async () => {
    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toEqual([]);
  });
});
