import app from "@/app";
import { TestDataSource } from "@/db/data-source.e2e";
import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { Work, WorkStatus, WorkType } from "@/db/entities/work.entity";
import { makeWorkEntity } from "@/test/factories";

const range = "from=2026-01-01T00:00:00.000Z&to=2026-01-31T23:59:59.999Z";

describe("[E2E] Work Analytics Routes", () => {
  let test: TestHelpers;

  beforeAll(async () => {
    await TestDataSource.initialize();
    const ctx = await auth.$context;
    test = ctx.test;
  });

  beforeEach(async () => {
    // TRUNCATE (unlike DELETE) refuses tables with incoming FKs unless
    // truncated together, so clear every work table + user in one CASCADE statement.
    await TestDataSource.query(
      `TRUNCATE TABLE "book_detail", "movie_detail", "course_detail", "article_detail", "work", "user" CASCADE`,
    );
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  it("should return backlog items bucketed by when they entered the backlog", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create([
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.TO_CONSUME,
          created_at: new Date("2026-01-06"), // Monday
        }),
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.TO_CONSUME,
          created_at: new Date("2026-01-07"), // same week
        }),
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.COMPLETED, // not backlog anymore
          created_at: new Date("2026-01-06"),
        }),
      ]),
    );

    const res = await app.request(
      `/api/works/analytics/backlog?${range}&bucketUnit=week`,
      { headers },
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([
      expect.objectContaining({
        bucket_start: "2026-01-05T00:00:00.000Z",
        count: 2,
      }),
    ]);

    await test.deleteUser(user.id);
  });

  it("should return the status funnel for works entered in range", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create([
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.TO_CONSUME,
          created_at: new Date("2026-01-05"),
        }),
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.IN_PROGRESS,
          created_at: new Date("2026-01-06"),
        }),
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.COMPLETED,
          created_at: new Date("2026-01-07"),
        }),
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.ABANDONED,
          created_at: new Date("2026-01-08"),
        }),
      ]),
    );

    const res = await app.request(
      `/api/works/analytics/status-funnel?${range}`,
      { headers },
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      entered: 1,
      in_progress: 1,
      completed: 1,
      abandoned: 1,
    });

    await test.deleteUser(user.id);
  });

  it("should return the completed works count, filterable by type", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create([
        makeWorkEntity({
          user_id: user.id,
          type: WorkType.BOOK,
          status: WorkStatus.COMPLETED,
          completed_at: new Date("2026-01-10"),
        }),
        makeWorkEntity({
          user_id: user.id,
          type: WorkType.MOVIE,
          status: WorkStatus.COMPLETED,
          completed_at: new Date("2026-01-15"),
        }),
      ]),
    );

    const totalRes = await app.request(
      `/api/works/analytics/completed-count?${range}`,
      { headers },
    );
    expect(await totalRes.json()).toEqual({ count: 2 });

    const bookRes = await app.request(
      `/api/works/analytics/completed-count?${range}&type=book`,
      { headers },
    );
    expect(await bookRes.json()).toEqual({ count: 1 });

    await test.deleteUser(user.id);
  });

  it("should return the average wishlist wait time in seconds", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create([
        makeWorkEntity({
          user_id: user.id,
          created_at: new Date("2026-01-01"),
          started_at: new Date("2026-01-06"), // 5 days
        }),
        makeWorkEntity({
          user_id: user.id,
          created_at: new Date("2026-01-01"),
          started_at: new Date("2026-01-11"), // 10 days
        }),
      ]),
    );

    const res = await app.request(
      `/api/works/analytics/avg-wishlist-wait?${range}`,
      { headers },
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ avg_seconds: ((5 + 10) / 2) * 24 * 60 * 60 });

    await test.deleteUser(user.id);
  });

  it("should return null avg wishlist wait time when nothing has started yet", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      `/api/works/analytics/avg-wishlist-wait?${range}`,
      { headers },
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ avg_seconds: null });

    await test.deleteUser(user.id);
  });

  it("should not include another user's works in any analytics endpoint", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(
        makeWorkEntity({
          user_id: owner.id,
          status: WorkStatus.COMPLETED,
          completed_at: new Date("2026-01-10"),
        }),
      ),
    );

    const headers = await test.getAuthHeaders({ userId: other.id });

    const res = await app.request(
      `/api/works/analytics/completed-count?${range}`,
      { headers },
    );

    expect(await res.json()).toEqual({ count: 0 });

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });

  it("should return 401 when unauthenticated", async () => {
    const res = await app.request(
      `/api/works/analytics/status-funnel?${range}`,
    );

    expect(res.status).toBe(401);
  });

  it("should return 422 when required query params are missing", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request("/api/works/analytics/backlog", {
      headers,
    });

    expect(res.status).toBe(422);

    await test.deleteUser(user.id);
  });

  it("should return current consumption counts on GET /works/analytics/summary", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create([
        makeWorkEntity({
          user_id: user.id,
          status: WorkStatus.COMPLETED,
          completed_at: new Date(),
        }),
        makeWorkEntity({ user_id: user.id, status: WorkStatus.TO_CONSUME }),
        makeWorkEntity({ user_id: user.id, status: WorkStatus.TO_CONSUME }),
        makeWorkEntity({ user_id: user.id, status: WorkStatus.IN_PROGRESS }),
      ]),
    );

    const res = await app.request("/api/works/analytics/summary", {
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      consumed_this_month: 1,
      backlog_now: 2,
      in_progress_now: 1,
    });

    await test.deleteUser(user.id);
  });
});
