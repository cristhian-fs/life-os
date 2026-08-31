import type { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";

export interface CreatePurchaseWishlistInput {
  user_id: string;
  work_id?: string | null;
  title?: string | null;
  estimated_price_in_cents?: number | null;
  currency?: string | null;
  store_or_url: string;
  purchased_at?: Date | null;
}
export interface PurchaseWishlistRepository {
  create(habit: CreatePurchaseWishlistInput): Promise<PurchaseWishlist>;
  findById(habitId: string): Promise<PurchaseWishlist | null>;
  findManyByUserId(userId: string): Promise<PurchaseWishlist[]>;
  save(habit: PurchaseWishlist): Promise<PurchaseWishlist>;
  delete(habitId: string): Promise<void>;
}
