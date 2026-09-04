import { randomUUID } from "node:crypto";
import { type PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type {
  CreatedByMonthCount,
  CreatePurchaseWishlistInput,
  PendingWishlistSummary,
  PurchasedByMonthCount,
  PurchaseWishlistRepository,
} from "@/repositories/purchase-wishlist-repository";

export class InMemoryPurchaseWishlistRepository implements PurchaseWishlistRepository {
  public items: PurchaseWishlist[] = [];

  async create(data: CreatePurchaseWishlistInput): Promise<PurchaseWishlist> {
    const purchaseWishlist: PurchaseWishlist = {
      id: randomUUID(),
      user_id: data.user_id,
      work_id: data.work_id ?? null,
      title: data.title ?? null,
      estimated_price_in_cents: data.estimated_price_in_cents ?? null,
      currency: data.currency ?? null,
      image_url: data.image_url ?? null,
      purchased_at: data.purchased_at ?? null,
      store_or_url: data.store_or_url,
      created_at: new Date(),
    };
    this.items.push(purchaseWishlist);
    return purchaseWishlist;
  }

  async delete(purchaseWishlistId: string): Promise<void> {
    const purchaseWishlistIndex = this.items.findIndex(
      (item) => item.id === purchaseWishlistId,
    );
    if (purchaseWishlistIndex === -1) return;
    this.items.splice(purchaseWishlistIndex, 1);
  }

  async findById(purchaseWishlistId: string): Promise<PurchaseWishlist | null> {
    const purchaseWishlist = this.items.find(
      (item) => item.id === purchaseWishlistId,
    );

    if (!purchaseWishlist) return null;

    return purchaseWishlist;
  }

  async findManyByUserId(userId: string): Promise<PurchaseWishlist[]> {
    const purchasewishlist = this.items.filter(
      (item) => item.user_id === userId,
    );

    if (!purchasewishlist.length) return [];

    return purchasewishlist;
  }

  async save(purchaseWishlist: PurchaseWishlist): Promise<PurchaseWishlist> {
    const purchaseWishlistIndex = this.items.findIndex(
      (item) => item.id === purchaseWishlist.id,
    );

    if (purchaseWishlistIndex === -1)
      throw new Error(
        `Cannot save purchaseWishlist ${purchaseWishlist.id}: not found in repository`,
      );

    this.items[purchaseWishlistIndex] = purchaseWishlist;
    return purchaseWishlist;
  }

  async getPendingSummary(userId: string): Promise<PendingWishlistSummary> {
    const pending = this.items.filter(
      (item) => item.user_id === userId && item.purchased_at === null,
    );

    return {
      count: pending.length,
      totalEstimatedCents: pending.reduce(
        (sum, item) => sum + (item.estimated_price_in_cents ?? 0),
        0,
      ),
    };
  }

  async countCreatedByMonth(
    userId: string,
    year: number,
  ): Promise<CreatedByMonthCount> {
    return this.countByMonth(userId, year, (item) => item.created_at);
  }

  async countPurchasedByMonth(
    userId: string,
    year: number,
  ): Promise<PurchasedByMonthCount> {
    return this.countByMonth(userId, year, (item) => item.purchased_at);
  }

  // Mirrors the typeorm repo's date_trunc('month', ...) grouping: only months
  // with at least one row are returned, gaps are filled later by buildPurchaseTimeline.
  private countByMonth(
    userId: string,
    year: number,
    dateOf: (item: PurchaseWishlist) => Date | null,
  ): CreatedByMonthCount {
    const counts = new Map<number, number>();

    for (const item of this.items) {
      if (item.user_id !== userId) continue;
      const date = dateOf(item);
      if (!date || date.getUTCFullYear() !== year) continue;

      const monthIndex = date.getUTCMonth();
      counts.set(monthIndex, (counts.get(monthIndex) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort(([a], [b]) => a - b)
      .map(([monthIndex, count]) => ({
        month: new Date(Date.UTC(year, monthIndex, 1)),
        count,
      }));
  }
}
