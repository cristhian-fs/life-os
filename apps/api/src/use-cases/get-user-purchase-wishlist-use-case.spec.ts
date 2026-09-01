import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPurchaseWishlistRepository } from "@/repositories/in-memory/in-memory-purchase-wishlist-repository";
import { GetUserPurchaseWishlistUseCase } from "./get-user-purchase-wishlist-use-case";

let purchaseWishlistRepository: InMemoryPurchaseWishlistRepository;
let sut: GetUserPurchaseWishlistUseCase;

describe("Get User Purchase Wishlist Use Case", () => {
  beforeEach(() => {
    purchaseWishlistRepository = new InMemoryPurchaseWishlistRepository();
    sut = new GetUserPurchaseWishlistUseCase(purchaseWishlistRepository);
  });

  it("should list only the requesting user's wishlist items", async () => {
    await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
      title: "User 01 item",
    });
    await purchaseWishlistRepository.create({
      user_id: "user_02",
      store_or_url: "https://amazon.com.br",
      title: "User 02 item",
    });

    const { items } = await sut.execute({ userId: "user_01" });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(
      expect.objectContaining({ title: "User 01 item" }),
    );
  });

  it("should return an empty list when the user has no wishlist items", async () => {
    const { items } = await sut.execute({ userId: "user_01" });

    expect(items).toEqual([]);
  });
});
