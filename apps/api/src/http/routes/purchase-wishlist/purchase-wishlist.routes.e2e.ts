import app from "@/app";
import { TestDataSource, initializeTestDataSource } from "@/db/data-source.e2e";
import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import { Work } from "@/db/entities/work.entity";
import { makeWork } from "@/test/factories";

describe("[E2E] Purchase Wishlist Routes", () => {
  let test: TestHelpers;

  beforeAll(async () => {
    await initializeTestDataSource();
    const ctx = await auth.$context;
    test = ctx.test;
  });

  beforeEach(async () => {
    // TRUNCATE (unlike DELETE) refuses tables with incoming FKs unless
    // truncated together, so clear both work and purchase_wishlist + user in one CASCADE statement.
    await TestDataSource.query(
      `TRUNCATE TABLE "purchase_wishlist", "work", "user" CASCADE`,
    );
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  it("should list an empty list for the user with no wishlist items added", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request("/api/purchase-wishlist", { headers });
    const items = await res.json();

    expect(items).toEqual([]);
  });

  it("should list a wishlist item with its work relation loaded", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const work = await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(
        makeWork({ user_id: user.id, title: "The Hobbit" }),
      ),
    );
    await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: user.id,
        work_id: work.id,
        store_or_url: "https://amazon.com.br",
      }),
    );

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request("/api/purchase-wishlist", { headers });
    const items = await res.json();

    expect(items).toHaveLength(1);
    expect(items[0].work).toEqual(
      expect.objectContaining({ id: work.id, title: "The Hobbit" }),
    );

    await test.deleteUser(user.id);
  });

  it("should list a wishlist item with a null work when none is attached", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: user.id,
        store_or_url: "https://amazon.com.br",
      }),
    );

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request("/api/purchase-wishlist", { headers });
    const items = await res.json();

    expect(items).toHaveLength(1);
    expect(items[0].work).toBeNull();

    await test.deleteUser(user.id);
  });

  it("should not list wishlist items belonging to another user", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: owner.id,
        store_or_url: "https://amazon.com.br",
      }),
    );

    const headers = await test.getAuthHeaders({ userId: other.id });

    const res = await app.request("/api/purchase-wishlist", { headers });
    const items = await res.json();

    expect(items).toEqual([]);

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });

  it("should create a wishlist item on POST", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request("/api/purchase-wishlist", {
      method: "POST",
      headers,
      body: JSON.stringify({
        store_or_url: "https://amazon.com.br",
        title: "New item",
        estimated_price_in_cents: 1500,
        currency: "USD",
      }),
    });
    const item = await res.json();

    expect(res.status).toBe(200);
    expect(item).toEqual(
      expect.objectContaining({
        user_id: user.id,
        title: "New item",
        estimated_price_in_cents: 1500,
        currency: "USD",
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should not create a wishlist item that ignores a client-sent user_id", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    const headers = await test.getAuthHeaders({ userId: other.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request("/api/purchase-wishlist", {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: owner.id,
        store_or_url: "https://amazon.com.br",
      }),
    });
    const item = await res.json();

    expect(item.user_id).toBe(other.id);

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });

  it("should return 404 creating a wishlist item for a work that doesn't exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request("/api/purchase-wishlist", {
      method: "POST",
      headers,
      body: JSON.stringify({
        store_or_url: "https://amazon.com.br",
        work_id: "00000000-0000-0000-0000-000000000000",
      }),
    });

    expect(res.status).toBe(404);

    await test.deleteUser(user.id);
  });

  it("should get a wishlist item by id on GET", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const item = await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: user.id,
        store_or_url: "https://amazon.com.br",
        title: "New item",
      }),
    );

    const res = await app.request(`/api/purchase-wishlist/${item.id}`, {
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(expect.objectContaining({ id: item.id, title: "New item" }));

    await test.deleteUser(user.id);
  });

  it("should return 404 getting a wishlist item that belongs to another user", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    const item = await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: owner.id,
        store_or_url: "https://amazon.com.br",
      }),
    );

    const headers = await test.getAuthHeaders({ userId: other.id });

    const res = await app.request(`/api/purchase-wishlist/${item.id}`, {
      headers,
    });

    expect(res.status).toBe(404);

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });

  it("should return the updated wishlist item after a PATCH request", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const item = await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: user.id,
        store_or_url: "https://amazon.com.br",
        title: "Old title",
      }),
    );

    headers.set("Content-Type", "application/json");
    const res = await app.request(`/api/purchase-wishlist/${item.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        title: "New title",
        purchased_at: "2024-01-01T00:00:00.000Z",
        currency: "BRL",
      }),
    });
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated).toEqual(
      expect.objectContaining({
        id: item.id,
        title: "New title",
        purchased_at: "2024-01-01T00:00:00.000Z",
        currency: "BRL",
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should return 404 patching a wishlist item that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request(
      "/api/purchase-wishlist/00000000-0000-0000-0000-000000000000",
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title: "Anything" }),
      },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({ message: "Wishlist item not found" }),
    );

    await test.deleteUser(user.id);
  });

  it("should return 404 attaching a work owned by another user on PATCH", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    const item = await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: other.id,
        store_or_url: "https://amazon.com.br",
      }),
    );
    const work = await TestDataSource.getRepository(Work).save(
      TestDataSource.getRepository(Work).create(makeWork({ user_id: owner.id })),
    );

    const headers = await test.getAuthHeaders({ userId: other.id });
    headers.set("Content-Type", "application/json");

    const res = await app.request(`/api/purchase-wishlist/${item.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ work_id: work.id }),
    });

    expect(res.status).toBe(404);

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });

  it("should delete a wishlist item on DELETE", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const item = await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: user.id,
        store_or_url: "https://amazon.com.br",
      }),
    );

    const res = await app.request(`/api/purchase-wishlist/${item.id}`, {
      method: "DELETE",
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({ success: true, message: "Wishlist item deleted" }),
    );

    const stored = await TestDataSource.getRepository(PurchaseWishlist).findOneBy({
      id: item.id,
    });
    expect(stored).toBeNull();

    await test.deleteUser(user.id);
  });

  it("should return 404 deleting a wishlist item that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/purchase-wishlist/00000000-0000-0000-0000-000000000000",
      { method: "DELETE", headers },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({ success: false, message: "Wishlist item not found" }),
    );

    await test.deleteUser(user.id);
  });

  it("should not delete a wishlist item that belongs to another user", async () => {
    const owner = test.createUser({ email: "owner@example.com" });
    await test.saveUser(owner);
    const other = test.createUser({ email: "other@example.com" });
    await test.saveUser(other);

    const item = await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create({
        user_id: owner.id,
        store_or_url: "https://amazon.com.br",
      }),
    );

    const headers = await test.getAuthHeaders({ userId: other.id });

    const res = await app.request(`/api/purchase-wishlist/${item.id}`, {
      method: "DELETE",
      headers,
    });

    expect(res.status).toBe(404);

    const stored = await TestDataSource.getRepository(PurchaseWishlist).findOneBy({
      id: item.id,
    });
    expect(stored).not.toBeNull();

    await test.deleteUser(owner.id);
    await test.deleteUser(other.id);
  });

  it("should return the pending count and total on GET /purchase-wishlist/summary", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(PurchaseWishlist).save(
      TestDataSource.getRepository(PurchaseWishlist).create([
        {
          user_id: user.id,
          store_or_url: "https://amazon.com",
          estimated_price_in_cents: 1000,
          purchased_at: null,
        },
        {
          user_id: user.id,
          store_or_url: "https://amazon.com",
          estimated_price_in_cents: 2500,
          purchased_at: null,
        },
        {
          user_id: user.id,
          store_or_url: "https://amazon.com",
          estimated_price_in_cents: 5000,
          purchased_at: new Date(), // already purchased, excluded
        },
      ]),
    );

    const res = await app.request("/api/purchase-wishlist/summary", {
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      pending_count: 2,
      pending_total_estimated_cents: 3500,
    });

    await test.deleteUser(user.id);
  });
});
