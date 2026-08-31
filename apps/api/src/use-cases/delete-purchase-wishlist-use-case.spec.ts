import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPurchaseWishlistRepository } from "@/repositories/in-memory/in-memory-purchase-wishlist-repository";
import { DeletePurchaseWishlistUseCase } from "./delete-purchase-wishlist-use-case";

let purchaseWishlistRepository: InMemoryPurchaseWishlistRepository;
let sut: DeletePurchaseWishlistUseCase;

describe("Delete Purchase Wishlist Use Case", () => {
  beforeEach(() => {
    purchaseWishlistRepository = new InMemoryPurchaseWishlistRepository();
    sut = new DeletePurchaseWishlistUseCase(purchaseWishlistRepository);
  });

  it("should be able to delete a wishlist item", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });

    const { success } = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: item.id,
    });

    expect(success).toBeTruthy();
    expect(await purchaseWishlistRepository.findById(item.id)).toBeNull();
  });

  it("should not delete an item that belongs to another user", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });

    const result = await sut.execute({
      userId: "user_02",
      purchaseWishlistId: item.id,
    });

    expect(result).toEqual({ success: false, reason: "forbidden" });
    expect(await purchaseWishlistRepository.findById(item.id)).not.toBeNull();
  });

  it("should return not_found when the item does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      purchaseWishlistId: "non-existing-id",
    });

    expect(result).toEqual({ success: false, reason: "not_found" });
  });
});
