import type { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type { PurchaseWishlistResponse } from "@/schemas/purchase-wishlist.schema";

export class PurchaseWishlistPresenter {
  static toHTTP(item: PurchaseWishlist): PurchaseWishlistResponse {
    return {
      id: item.id,
      user_id: item.user_id,
      work_id: item.work_id,
      work: item.work
        ? {
            id: item.work.id,
            type: item.work.type,
            title: item.work.title,
            creator: item.work.creator,
            status: item.work.status,
            image_url: item.work.image_url,
          }
        : null,
      title: item.title,
      estimated_price_in_cents: item.estimated_price_in_cents,
      currency: item.currency,
      store_or_url: item.store_or_url,
      purchased_at: item.purchased_at?.toISOString() ?? null,
      created_at: item.created_at.toISOString(),
    };
  }

  static toHTTPList(items: PurchaseWishlist[]): PurchaseWishlistResponse[] {
    return items.map(PurchaseWishlistPresenter.toHTTP);
  }
}
