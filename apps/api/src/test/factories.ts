import { randomUUID } from "node:crypto";
import type { Entry } from "@/db/entities/entry.entity";
import { HabitGoalPeriod, HabitStatus, HabitType } from "@/db/entities/habit.entity";
import type { CreateHabitInput } from "@/repositories/habit-repository";

// ponytail: hand-rolled random picks instead of pulling in @faker-js/faker for two fields
function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

/** Builds a valid CreateHabitInput with randomized data. Pass overrides for anything a test cares about. */
export function makeHabit(
  overrides: Partial<CreateHabitInput> = {},
): CreateHabitInput {
  return {
    user_id: randomUUID(),
    name: `Habit ${randomUUID().slice(0, 8)}`,
    description: null,
    type: pick(Object.values(HabitType)),
    unit: null,
    goal_value: randomInt(100),
    goal_period: pick(Object.values(HabitGoalPeriod)),
    ...overrides,
  };
}

/** Builds row data for seeding the Habit table directly via TypeORM (bypassing the repository/use-case layer, which sets status itself). */
export function makeHabitEntity(overrides: Partial<CreateHabitInput> = {}) {
  return {
    ...makeHabit(overrides),
    status: HabitStatus.ACTIVE,
    created_at: new Date(),
  };
}

/** Builds a full Entry with randomized data. Pass user_id/habit_id to link it to a real habit. */
export function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: randomUUID(),
    user_id: randomUUID(),
    habit_id: randomUUID(),
    date: new Date(),
    value_boolean: null,
    value_numeric: randomInt(100),
    note: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as Entry;
}
