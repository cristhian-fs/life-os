import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPurchaseWishlistRepository } from "@/repositories/in-memory/in-memory-purchase-wishlist-repository";
import { InMemoryWorkRepository } from "@/repositories/in-memory/in-memory-work-repository";
import { makeWork } from "@/test/factories";
import { UpdatePurchaseWishlistUseCase } from "./update-purchase-wishlist-use-case";

let purchaseWishlistRepository: InMemoryPurchaseWishlistRepository;
let worksRepository: InMemoryWorkRepository;
let sut: UpdatePurchaseWishlistUseCase;

describe("Update Purchase Wishlist Use Case", () => {
  beforeEach(() => {
    purchaseWishlistRepository = new InMemoryPurchaseWishlistRepository();
    worksRepository = new InMemoryWorkRepository();
    sut = new UpdatePurchaseWishlistUseCase(
      purchaseWishlistRepository,
      worksRepository,
    );
  });

  it("should be able to update a wishlist item", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
      title: "Old title",
      estimated_price_in_cents: 1000,
    });

    const { success, data } = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
      payload: { title: "New title", estimated_price_in_cents: 2000 },
    });

    expect(success).toBeTruthy();
    expect(data).toEqual(
      expect.objectContaining({
        title: "New title",
        estimated_price_in_cents: 2000,
      }),
    );
  });

  it("should be able to update the currency", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
      currency: "USD",
    });

    const { data } = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
      payload: { currency: "BRL" },
    });

    expect(data?.currency).toBe("BRL");
  });

  it("should be able to set purchased_at", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });

    const { data } = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
      payload: { purchased_at: "2024-01-01T00:00:00.000Z" },
    });

    expect(data?.purchased_at).toEqual(new Date("2024-01-01T00:00:00.000Z"));
  });

  it("should be able to attach an existing work owned by the user", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01" }),
    );

    const { success, data } = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
      payload: { work_id: work.id },
    });

    expect(success).toBeTruthy();
    expect(data?.work_id).toEqual(work.id);
  });

  it("should not attach a work owned by another user", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });
    const work = await worksRepository.create(
      makeWork({ user_id: "user_02" }),
    );

    const result = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
      payload: { work_id: work.id },
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "work_forbidden",
    });
  });

  it("should not attach a non-existent work", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });

    const result = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
      payload: { work_id: "non-existing-id" },
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "work_not_found",
    });
  });

  it("should not update an item that belongs to another user", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });

    const result = await sut.execute({
      userId: "user_02",
      purchaseWishlistId: item.id,
      payload: { title: "Hijacked" },
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "forbidden",
    });
  });

  it("should return not_found when the item does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: "non-existing-id",
      payload: { title: "New title" },
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "not_found",
    });
  });
});
