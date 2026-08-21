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
import { Entry } from "@/db/entities/entry.entity";
import { makeEntryEntity, makeHabit, makeHabitEntity } from "@/test/factories";

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

  it("should return the updated habit after a PATCH request", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create({
        user_id: user.id,
        name: "Drink water",
        status: HabitStatus.ACTIVE,
        unit: "ml",
        goal_value: 3000,
        goal_period: HabitGoalPeriod.DAILY,
        type: HabitType.NUMERIC,
        created_at: new Date(),
      }),
    );

    headers.set("Content-Type", "application/json");
    const res = await app.request(`/api/habits/${habit.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        name: "Drink more water",
        goal_value: 4000,
      }),
    });
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated).toEqual(
      expect.objectContaining({
        id: habit.id,
        name: "Drink more water",
        goal_value: 4000,
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should create a habit on POST", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const { user_id: _userId, ...body } = makeHabit();

    const res = await app.request("/api/habits", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const habit = await res.json();

    expect(res.status).toBe(200);
    expect(habit).toEqual(
      expect.objectContaining({
        user_id: user.id,
        name: body.name,
        status: HabitStatus.ACTIVE,
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should delete a habit on DELETE", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create(makeHabitEntity({ user_id: user.id })),
    );

    const res = await app.request(`/api/habits/${habit.id}`, {
      method: "DELETE",
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({ success: true, message: "Habit deleted" }),
    );

    const stored = await TestDataSource.getRepository(Habit).findOneBy({
      id: habit.id,
    });
    expect(stored).toBeNull();

    await test.deleteUser(user.id);
  });

  it("should return 404 deleting a habit that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/habits/00000000-0000-0000-0000-000000000000",
      { method: "DELETE", headers },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({ success: false, message: "Habit not found" }),
    );

    await test.deleteUser(user.id);
  });

  it("should archive a habit on PATCH /habits/{id}/archive", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create(makeHabitEntity({ user_id: user.id })),
    );

    const res = await app.request(`/api/habits/${habit.id}/archive`, {
      method: "PATCH",
      headers,
    });
    const archived = await res.json();

    expect(res.status).toBe(200);
    expect(archived).toEqual(
      expect.objectContaining({
        id: habit.id,
        status: HabitStatus.ARCHIVED,
      }),
    );
    expect(archived.archived_at).not.toBeNull();

    await test.deleteUser(user.id);
  });

  it("should return the habit's best streaks on GET", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create({
        ...makeHabit({ user_id: user.id, type: HabitType.BOOLEAN }),
        status: HabitStatus.ACTIVE,
        // pin the report window so the test doesn't depend on "now"
        created_at: new Date("2026-01-01"),
        archived_at: new Date("2026-01-05"),
      }),
    );
    await TestDataSource.getRepository(Entry).save(
      TestDataSource.getRepository(Entry).create(
        [1, 2, 3].map((day) =>
          makeEntryEntity({
            user_id: user.id,
            habit_id: habit.id,
            date: new Date(`2026-01-0${day}`),
            value_boolean: true,
          }),
        ),
      ),
    );

    const res = await app.request(`/api/habits/${habit.id}/best-streaks`, {
      headers,
    });
    const streaks = await res.json();

    expect(res.status).toBe(200);
    expect(streaks).toEqual([
      expect.objectContaining({ streak_num: 3 }),
    ]);

    await test.deleteUser(user.id);
  });

  it("should return 404 for best streaks of a habit that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/habits/00000000-0000-0000-0000-000000000000/best-streaks",
      { headers },
    );

    expect(res.status).toBe(404);

    await test.deleteUser(user.id);
  });
});
