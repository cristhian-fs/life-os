import { randomUUID } from "node:crypto";
import { type PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type {
  CreatePurchaseWishlistInput,
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
}
