import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPurchaseWishlistRepository } from "@/repositories/in-memory/in-memory-purchase-wishlist-repository";
import { GetPurchaseWishlistUseCase } from "./get-purchase-wishlist-use-case";

let purchaseWishlistRepository: InMemoryPurchaseWishlistRepository;
let sut: GetPurchaseWishlistUseCase;

describe("Get Purchase Wishlist Use Case", () => {
  beforeEach(() => {
    purchaseWishlistRepository = new InMemoryPurchaseWishlistRepository();
    sut = new GetPurchaseWishlistUseCase(purchaseWishlistRepository);
  });

  it("should be able to get a purchase wishlist item by id", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
      title: "New item",
    });

    const { success, data } = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
    });

    expect(success).toBeTruthy();
    expect(data).toEqual(expect.objectContaining({ title: "New item" }));
  });

  it("should not get an item that belongs to another user", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });

    const result = await sut.execute({
      userId: "user_02",
      purchaseWishlistId: item.id,
    });

    expect(result).toEqual({ success: false, data: null, reason: "forbidden" });
  });

  it("should return not_found when the item does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: "non-existing-id",
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "not_found",
    });
  });
});
