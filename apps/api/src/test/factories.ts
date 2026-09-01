import { randomUUID } from "node:crypto";
import {
  HabitGoalPeriod,
  HabitStatus,
  HabitType,
} from "@/db/entities/habit.entity";
import { WorkStatus, WorkType, type Work } from "@/db/entities/work.entity";
import type { CreateEntryInput } from "@/repositories/entry-repository";
import type { CreateHabitInput } from "@/repositories/habit-repository";
import type { CreateWorkInput } from "@/repositories/work-repository";

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

/** Builds a valid CreateEntryInput with randomized data. Pass overrides for anything a test cares about. */
export function makeEntry(
  overrides: Partial<CreateEntryInput> = {},
): CreateEntryInput {
  return {
    user_id: randomUUID(),
    habit_id: randomUUID(),
    date: new Date(),
    value_boolean: null,
    value_numeric: randomInt(100),
    note: null,
    ...overrides,
  };
}

/** Builds row data for seeding the Entry table directly via TypeORM (bypassing the repository/use-case layer). */
export function makeEntryEntity(overrides: Partial<CreateEntryInput> = {}) {
  return {
    ...makeEntry(overrides),
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/** Builds a valid CreateWorkInput with randomized data. Pass overrides for anything a test cares about. */
export function makeWork(
  overrides: Partial<CreateWorkInput> = {},
): CreateWorkInput {
  return {
    user_id: randomUUID(),
    title: `Work ${randomUUID().slice(0, 8)}`,
    creator: `Creator ${randomUUID().slice(0, 8)}`,
    type: pick(Object.values(WorkType)),
    status: pick(Object.values(WorkStatus)),
    ...overrides,
  };
}

/** Builds row data for seeding the Work table directly (bypassing the repository/use-case layer). Accepts any Work field, including nulls, unlike makeWork's CreateWorkInput-shaped overrides. */
export function makeWorkEntity(overrides: Partial<Work> = {}): Work {
  return {
    id: randomUUID(),
    ...makeWork(),
    rating: null,
    started_at: null,
    completed_at: null,
    summary: null,
    external_url: null,
    image_url: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as Work;
}
