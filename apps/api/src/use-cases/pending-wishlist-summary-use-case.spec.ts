import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPurchaseWishlistRepository } from "@/repositories/in-memory/in-memory-purchase-wishlist-repository";
import { PendingWishlistSummaryUseCase } from "./pending-wishlist-summary-use-case";

let purchaseWishlistRepository: InMemoryPurchaseWishlistRepository;
let sut: PendingWishlistSummaryUseCase;

describe("Pending Wishlist Summary Use Case", () => {
  beforeEach(() => {
    purchaseWishlistRepository = new InMemoryPurchaseWishlistRepository();
    sut = new PendingWishlistSummaryUseCase(purchaseWishlistRepository);
  });

  it("counts and sums only items not yet purchased", async () => {
    await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com",
      estimated_price_in_cents: 1000,
    });
    await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com",
      estimated_price_in_cents: 2500,
    });
    await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com",
      estimated_price_in_cents: 5000,
      purchased_at: new Date(), // already bought, excluded
    });
    await purchaseWishlistRepository.create({
      user_id: "user_02", // other user, excluded
      store_or_url: "https://amazon.com",
      estimated_price_in_cents: 9999,
    });

    const { count, totalEstimatedCents } = await sut.execute({
      userId: "user_01",
    });

    expect(count).toBe(2);
    expect(totalEstimatedCents).toBe(3500);
  });

  it("treats a missing estimated price as 0 in the sum", async () => {
    await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com",
    });

    const { count, totalEstimatedCents } = await sut.execute({
      userId: "user_01",
    });

    expect(count).toBe(1);
    expect(totalEstimatedCents).toBe(0);
  });

  it("returns zeros when there's nothing pending", async () => {
    const result = await sut.execute({ userId: "user_01" });

    expect(result).toEqual({ count: 0, totalEstimatedCents: 0 });
  });
});
