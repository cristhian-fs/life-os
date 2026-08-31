import type { PurchaseWishlistRepository } from "@/repositories/purchase-wishlist-repository";

interface DeletePurchaseWishlistUseCaseRequest {
  userId: string;
  purchaseWishlistId: string;
}

type DeletePurchaseWishlistUseCaseResponse =
  | { success: true }
  | { success: false; reason: "not_found" | "forbidden" };

export class DeletePurchaseWishlistUseCase {
  constructor(
    private purchaseWishlistRepository: PurchaseWishlistRepository,
  ) {}

  async execute({
    userId,
    purchaseWishlistId,
  }: DeletePurchaseWishlistUseCaseRequest): Promise<DeletePurchaseWishlistUseCaseResponse> {
    const item =
      await this.purchaseWishlistRepository.findById(purchaseWishlistId);

    if (!item) {
      return { success: false, reason: "not_found" };
    }
    if (item.user_id !== userId) {
      return { success: false, reason: "forbidden" };
    }

    await this.purchaseWishlistRepository.delete(purchaseWishlistId);

    return { success: true };
  }
}
