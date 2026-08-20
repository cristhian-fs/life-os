import app from "@/app";
import { TestDataSource } from "@/db/data-source.e2e";
import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import {
  Habit,
  HabitGoalPeriod,
  HabitStatus,
  HabitType,
} from "@/db/entities/habit.entity";

describe("[E2E] Habits Routes", () => {
  let test: TestHelpers;

  beforeAll(async () => {
    await TestDataSource.initialize();
    const ctx = await auth.$context;
    test = ctx.test;
  });

  beforeEach(async () => {
    // TRUNCATE (unlike DELETE) refuses tables with incoming FKs unless
    // truncated together, so clear entry/habit/user in one CASCADE statement.
    await TestDataSource.query(
      `TRUNCATE TABLE "entry", "habit", "user" CASCADE`,
    );
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  it("should list an empty list for the user with no habits added", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    // Get Authenticated headers
    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request("/api/habits", {
      headers,
    });
    const habits = await res.json();

    expect(habits).toEqual([]);
  });

  it("should list a list of the user habits", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    // Get Authenticated headers
    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create([
        {
          user_id: user.id,
          name: "Drink water",
          status: HabitStatus.ACTIVE,
          unit: "ml",
          goal_value: 3000,
          goal_period: HabitGoalPeriod.DAILY,
          type: HabitType.NUMERIC,
          created_at: new Date(),
        },
        {
          user_id: user.id,
          name: "Walk on the morning",
          status: HabitStatus.ACTIVE,
          unit: "minutes",
          goal_value: 60,
          goal_period: HabitGoalPeriod.DAILY,
          type: HabitType.NUMERIC,
          created_at: new Date(),
        },
      ]),
    );
    const res = await app.request("/api/habits", {
      headers,
    });
    const habits = await res.json();

    expect(habits).toHaveLength(2);
    expect(habits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Drink water" }),
        expect.objectContaining({ name: "Walk on the morning" }),
      ]),
    );

    await test.deleteUser(user.id);
  });
});
