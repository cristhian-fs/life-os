import { buildPurchaseTimeline } from "@/reports/build-purchase-timeline";
import type { PurchaseWishlistRepository } from "@/repositories/purchase-wishlist-repository";

interface GetPurchaseWishlistCountByMonthUseCaseRequest {
  userId: string;
  year: number;
}

type GetPurchaseWishlistCountByMonthUseCaseResponse = Array<{
  month: Date;
  created: number;
  purchased: number;
}>;

export class GetPurchaseWishlistCountByMonthUseCase {
  constructor(private purchaseWishlist: PurchaseWishlistRepository) {}

  async execute({
    userId,
    year,
  }: GetPurchaseWishlistCountByMonthUseCaseRequest): Promise<GetPurchaseWishlistCountByMonthUseCaseResponse> {
    const [created, purchased] = await Promise.all([
      this.purchaseWishlist.countCreatedByMonth(userId, year),
      this.purchaseWishlist.countPurchasedByMonth(userId, year),
    ]);

    return buildPurchaseTimeline(created, purchased, year);
  }
}
