import app from "@/app";
import { TestDataSource } from "@/db/data-source.e2e";
import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { Entry } from "@/db/entities/entry.entity";
import { Habit } from "@/db/entities/habit.entity";
import { makeEntryEntity, makeHabitEntity } from "@/test/factories";

describe("[E2E] Entries Routes", () => {
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

  it("should list an empty array for a habit with no entries", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create(
        makeHabitEntity({ user_id: user.id }),
      ),
    );

    const res = await app.request(
      `/api/entries?habitId=${habit.id}&startDate=2026-01-01T00:00:00.000Z&endDate=2026-01-31T00:00:00.000Z`,
      { headers },
    );
    const entries = await res.json();

    expect(res.status).toBe(200);
    expect(entries).toEqual([]);

    await test.deleteUser(user.id);
  });

  it("should list only the entries within the date range", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create(
        makeHabitEntity({ user_id: user.id }),
      ),
    );
    await TestDataSource.getRepository(Entry).save(
      TestDataSource.getRepository(Entry).create([
        makeEntryEntity({
          user_id: user.id,
          habit_id: habit.id,
          date: new Date("2026-01-10"),
        }),
        makeEntryEntity({
          user_id: user.id,
          habit_id: habit.id,
          date: new Date("2026-03-01"),
        }),
      ]),
    );

    const res = await app.request(
      `/api/entries?habitId=${habit.id}&startDate=2026-01-01T00:00:00.000Z&endDate=2026-01-31T00:00:00.000Z`,
      { headers },
    );
    const entries = await res.json();

    expect(res.status).toBe(200);
    expect(entries).toHaveLength(1);

    await test.deleteUser(user.id);
  });

  it("should return 404 listing entries for a habit that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      `/api/entries?habitId=00000000-0000-0000-0000-000000000000&startDate=2026-01-01T00:00:00.000Z&endDate=2026-01-31T00:00:00.000Z`,
      { headers },
    );

    expect(res.status).toBe(404);

    await test.deleteUser(user.id);
  });

  it("should create an entry on POST", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create(
        makeHabitEntity({ user_id: user.id }),
      ),
    );

    const res = await app.request("/api/entries", {
      method: "POST",
      headers,
      body: JSON.stringify({
        habit_id: habit.id,
        date: new Date("2026-01-15").toISOString(),
        value_boolean: null,
        value_numeric: 2000,
        note: "Drank a lot of water",
      }),
    });
    const entry = await res.json();

    expect(res.status).toBe(200);
    expect(entry).toEqual(
      expect.objectContaining({
        user_id: user.id,
        habit_id: habit.id,
        value_numeric: 2000,
        note: "Drank a lot of water",
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should return 404 creating an entry for a habit that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request("/api/entries", {
      method: "POST",
      headers,
      body: JSON.stringify({
        habit_id: "00000000-0000-0000-0000-000000000000",
        date: new Date().toISOString(),
        value_boolean: null,
        value_numeric: null,
        note: null,
      }),
    });

    expect(res.status).toBe(404);

    await test.deleteUser(user.id);
  });

  it("should return the updated entry after a PATCH request", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create(
        makeHabitEntity({ user_id: user.id }),
      ),
    );
    const entry = await TestDataSource.getRepository(Entry).save(
      TestDataSource.getRepository(Entry).create(
        makeEntryEntity({ user_id: user.id, habit_id: habit.id }),
      ),
    );

    const res = await app.request(`/api/entries/${entry.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ note: "updated note", value_numeric: 4000 }),
    });
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated).toEqual(
      expect.objectContaining({
        id: entry.id,
        note: "updated note",
        value_numeric: 4000,
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should delete an entry on DELETE", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });

    const habit = await TestDataSource.getRepository(Habit).save(
      TestDataSource.getRepository(Habit).create(
        makeHabitEntity({ user_id: user.id }),
      ),
    );
    const entry = await TestDataSource.getRepository(Entry).save(
      TestDataSource.getRepository(Entry).create(
        makeEntryEntity({ user_id: user.id, habit_id: habit.id }),
      ),
    );

    const res = await app.request(`/api/entries/${entry.id}`, {
      method: "DELETE",
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({ success: true, message: "Entry deleted" }),
    );

    const stored = await TestDataSource.getRepository(Entry).findOneBy({
      id: entry.id,
    });
    expect(stored).toBeNull();

    await test.deleteUser(user.id);
  });

  it("should return 404 deleting an entry that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);
    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/entries/00000000-0000-0000-0000-000000000000",
      { method: "DELETE", headers },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({ success: false, message: "Entry not found" }),
    );

    await test.deleteUser(user.id);
  });
});
