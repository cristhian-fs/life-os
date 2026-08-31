import type { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type { PurchaseWishlistRepository } from "@/repositories/purchase-wishlist-repository";

interface GetPurchaseWishlistUseCaseRequest {
  userId: string;
  purchaseWishlistId: string;
}

type GetPurchaseWishlistUseCaseResponse =
  | { success: true; data: PurchaseWishlist }
  | { success: false; data: null; reason: "not_found" | "forbidden" };

export class GetPurchaseWishlistUseCase {
  constructor(
    private purchaseWishlistRepository: PurchaseWishlistRepository,
  ) {}

  async execute({
    userId,
    purchaseWishlistId,
  }: GetPurchaseWishlistUseCaseRequest): Promise<GetPurchaseWishlistUseCaseResponse> {
    const item =
      await this.purchaseWishlistRepository.findById(purchaseWishlistId);

    if (!item) {
      return { success: false, data: null, reason: "not_found" };
    }
    if (item.user_id !== userId) {
      return { success: false, data: null, reason: "forbidden" };
    }

    return { success: true, data: item };
  }
}
