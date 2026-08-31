import type { PendingWishlistSummary } from "@/repositories/purchase-wishlist-repository";
import type { PurchaseWishlistRepository } from "@/repositories/purchase-wishlist-repository";

interface PendingWishlistSummaryUseCaseRequest {
  userId: string;
}

export class PendingWishlistSummaryUseCase {
  constructor(private purchaseWishlistRepository: PurchaseWishlistRepository) {}

  async execute({
    userId,
  }: PendingWishlistSummaryUseCaseRequest): Promise<PendingWishlistSummary> {
    return this.purchaseWishlistRepository.getPendingSummary(userId);
  }
}
