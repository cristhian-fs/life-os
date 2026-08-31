import { beforeEach, describe, expect, it } from "vitest";
import { HabitStatus } from "@/db/entities/habit.entity";
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
      makeHabit({ user_id: "user_01" }),
    );
    const withoutEntry = await habitsRepository.create(
      makeHabit({ user_id: "user_01" }),
    );
    await entriesRepository.create(
      makeEntry({
        user_id: "user_01",
        habit_id: withEntry.id,
        date: new Date(),
      }),
    );

    const { habits } = await sut.execute({ userId: "user_01" });

    expect(habits).toHaveLength(1);
    expect(habits[0].id).toBe(withoutEntry.id);
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
