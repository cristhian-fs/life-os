import app from "@/app";
import { TestDataSource } from "@/db/data-source.e2e";
import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { Work, WorkType } from "@/db/entities/work.entity";
import { BookDetail } from "@/db/entities/book-detail.entity";
import { makeWork } from "@/test/factories";

describe("[E2E] Works Routes", () => {
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

  it("should list an empty list for the user with no works added", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request("/api/works", { headers });
    const works = await res.json();

    expect(works).toEqual([]);
  });

  it("should list the user's works with their detail relation loaded", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const work = await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(
        makeWork({ user_id: user.id, type: WorkType.BOOK, title: "The Hobbit" }),
      ),
    );
    await TestDataSource.getRepository(BookDetail).save(
      TestDataSource.getRepository(BookDetail).create({
        work_id: work.id,
        isbn: "9780618968633",
      }),
    );

    const res = await app.request("/api/works", { headers });
    const works = await res.json();

    expect(works).toHaveLength(1);
    expect(works[0]).toEqual(
      expect.objectContaining({
        id: work.id,
        title: "The Hobbit",
        detail: expect.objectContaining({ isbn: "9780618968633" }),
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should not list works belonging to another user", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(makeWork({ user_id: owner.id })),
    );

    const headers = await test.getAuthHeaders({ userId: other.id });

    const res = await app.request("/api/works", { headers });
    const works = await res.json();

    expect(works).toEqual([]);

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });

  it("should create a work item on POST", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request("/api/works", {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "book",
        title: "The Hobbit",
        creator: "J.R.R. Tolkien",
        status: "to_consume",
        image_url: "https://example.com/covers/the-hobbit.png",
        detail: { isbn: "9780618968633", pages: 310 },
      }),
    });
    const work = await res.json();

    expect(res.status).toBe(200);
    expect(work).toEqual(
      expect.objectContaining({
        user_id: user.id,
        type: "book",
        title: "The Hobbit",
        image_url: "https://example.com/covers/the-hobbit.png",
        detail: expect.objectContaining({ isbn: "9780618968633", pages: 310 }),
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should return the updated work item after a PATCH request", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const work = await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(
        makeWork({ user_id: user.id, type: WorkType.BOOK }),
      ),
    );

    headers.set("Content-Type", "application/json");
    const res = await app.request(`/api/works/${work.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        title: "Updated title",
        status: "completed",
        rating: 5,
        image_url: "https://example.com/covers/updated-cover.png",
      }),
    });
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated).toEqual(
      expect.objectContaining({
        id: work.id,
        title: "Updated title",
        status: "completed",
        rating: 5,
        type: "book",
        image_url: "https://example.com/covers/updated-cover.png",
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should not change a work item's type on PATCH", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const work = await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(
        makeWork({ user_id: user.id, type: WorkType.BOOK }),
      ),
    );

    headers.set("Content-Type", "application/json");
    // "type" isn't in UpdateWorkSchema, so it's silently ignored rather than applied.
    const res = await app.request(`/api/works/${work.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ title: "New title", type: "movie" }),
    });
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated.type).toBe("book");

    await test.deleteUser(user.id);
  });

  it("should return 404 patching a work item that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request(
      "/api/works/00000000-0000-0000-0000-000000000000",
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title: "Anything" }),
      },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({ message: "Work item not found" }),
    );

    await test.deleteUser(user.id);
  });

  it("should delete a work item on DELETE", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const work = await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(makeWork({ user_id: user.id })),
    );

    const res = await app.request(`/api/works/${work.id}`, {
      method: "DELETE",
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({ success: true, message: "Work item deleted" }),
    );

    const stored = await TestDataSource.getRepository(Work).findOneBy({
      id: work.id,
    });
    expect(stored).toBeNull();

    await test.deleteUser(user.id);
  });

  it("should return 404 deleting a work item that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/works/00000000-0000-0000-0000-000000000000",
      { method: "DELETE", headers },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({ success: false, message: "Work item not found" }),
    );

    await test.deleteUser(user.id);
  });

  it("should not delete a work item that belongs to another user", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    const work = await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(makeWork({ user_id: owner.id })),
    );

    const headers = await test.getAuthHeaders({ userId: other.id });

    const res = await app.request(`/api/works/${work.id}`, {
      method: "DELETE",
      headers,
    });

    expect(res.status).toBe(404);

    const stored = await TestDataSource.getRepository(Work).findOneBy({
      id: work.id,
    });
    expect(stored).not.toBeNull();

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });
});
