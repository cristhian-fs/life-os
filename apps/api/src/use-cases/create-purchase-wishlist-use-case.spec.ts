import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPurchaseWishlistRepository } from "@/repositories/in-memory/in-memory-purchase-wishlist-repository";
import { InMemoryWorkRepository } from "@/repositories/in-memory/in-memory-work-repository";
import { CreatePurchaseWishlistUseCase } from "./create-purchase-wishlist-use-case";

let purchaseWishlistRepository: InMemoryPurchaseWishlistRepository;
let worksRepository: InMemoryWorkRepository;
let sut: CreatePurchaseWishlistUseCase;

describe("Create Purchase Wishlist Use Case", () => {
  beforeEach(async () => {
    purchaseWishlistRepository = new InMemoryPurchaseWishlistRepository();
    worksRepository = new InMemoryWorkRepository();
    sut = new CreatePurchaseWishlistUseCase(
      purchaseWishlistRepository,
      worksRepository,
    );
  });

  it("should be able to create a purchase wishlist", async () => {
    const { success, data } = await sut.execute({
      userId: "user_01",
      payload: {
        user_id: "user_01",
        store_or_url: "https://amazon.com.br",
        estimated_price_in_cents: 15 * 100,
        currency: "USD",
        title: "New item",
      },
    });

    expect(success).toBeTruthy();
    expect(data).toEqual(
      expect.objectContaining({
        title: "New item",
        estimated_price_in_cents: 1500,
        currency: "USD",
      }),
    );

    const habitInMemory = await purchaseWishlistRepository.findById(data!.id);

    expect(habitInMemory).toEqual(
      expect.objectContaining({
        title: "New item",
        estimated_price_in_cents: 1500,
        currency: "USD",
      }),
    );
  });

  it("should default currency to null when not given", async () => {
    const { data } = await sut.execute({
      userId: "user_01",
      payload: {
        user_id: "user_01",
        store_or_url: "https://amazon.com.br",
      },
    });

    expect(data?.currency).toBeNull();
  });
  it("should not be able to create a purchase wishlist with a non-existent work", async () => {
    const { success, reason } = await sut.execute({
      userId: "user_01",
      payload: {
        user_id: "user_01",
        store_or_url: "https://amazon.com.br",
        estimated_price_in_cents: 15 * 100,
        title: "New item",
        work_id: "work_01",
      },
    });

    expect(success).toBeFalsy();
    expect(reason).toEqual("work_not_found");
    const habitInMemory =
      await purchaseWishlistRepository.findManyByUserId("user_01");

    expect(habitInMemory.length).toEqual(0);
  });
});
