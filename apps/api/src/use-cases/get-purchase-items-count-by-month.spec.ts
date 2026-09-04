import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPurchaseWishlistRepository } from "@/repositories/in-memory/in-memory-purchase-wishlist-repository";
import { GetPurchaseWishlistCountByMonthUseCase } from "./get-purchase-items-count-by-month";

let purchaseWishlistRepository: InMemoryPurchaseWishlistRepository;
let sut: GetPurchaseWishlistCountByMonthUseCase;

describe("Get Purchase Wishlist Count By Month Use Case", () => {
  beforeEach(() => {
    purchaseWishlistRepository = new InMemoryPurchaseWishlistRepository();
    sut = new GetPurchaseWishlistCountByMonthUseCase(
      purchaseWishlistRepository,
    );
  });

  it("should return 12 months, with zero counts for months with no activity", async () => {
    const result = await sut.execute({ userId: "user_01", year: 2026 });

    expect(result).toHaveLength(12);
    expect(result.every((entry) => entry.created === 0 && entry.purchased === 0)).toBe(
      true,
    );
    expect(result[0].month).toEqual(new Date(Date.UTC(2026, 0, 1)));
    expect(result[11].month).toEqual(new Date(Date.UTC(2026, 11, 1)));
  });

  it("should count items by the month they were created and the month they were purchased", async () => {
    const january = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });
    january.created_at = new Date(Date.UTC(2026, 0, 15));

    const march = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });
    march.created_at = new Date(Date.UTC(2026, 2, 1));
    march.purchased_at = new Date(Date.UTC(2026, 2, 20));

    const purchasedInFebruary = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });
    purchasedInFebruary.created_at = new Date(Date.UTC(2026, 0, 1));
    purchasedInFebruary.purchased_at = new Date(Date.UTC(2026, 1, 5));

    const result = await sut.execute({ userId: "user_01", year: 2026 });

    expect(result[0]).toEqual(
      expect.objectContaining({ created: 2, purchased: 0 }), // January
    );
    expect(result[1]).toEqual(
      expect.objectContaining({ created: 0, purchased: 1 }), // February
    );
    expect(result[2]).toEqual(
      expect.objectContaining({ created: 1, purchased: 1 }), // March
    );
  });

  it("should not count items belonging to another user", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_02",
      store_or_url: "https://amazon.com.br",
    });
    item.created_at = new Date(Date.UTC(2026, 0, 1));

    const result = await sut.execute({ userId: "user_01", year: 2026 });

    expect(result[0]).toEqual(
      expect.objectContaining({ created: 0, purchased: 0 }),
    );
  });

  it("should not count items created or purchased in a different year", async () => {
    const item = await purchaseWishlistRepository.create({
      user_id: "user_01",
      store_or_url: "https://amazon.com.br",
    });
    item.created_at = new Date(Date.UTC(2025, 0, 1));
    item.purchased_at = new Date(Date.UTC(2025, 0, 2));

    const result = await sut.execute({ userId: "user_01", year: 2026 });

    expect(result.every((entry) => entry.created === 0 && entry.purchased === 0)).toBe(
      true,
    );
  });
});
