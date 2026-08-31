import type { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type { PurchaseWishlistRepository } from "@/repositories/purchase-wishlist-repository";

interface GetUserPurchaseWishlistUseCaseRequest {
  userId: string;
}

interface GetUserPurchaseWishlistUseCaseResponse {
  items: PurchaseWishlist[];
}

export class GetUserPurchaseWishlistUseCase {
  constructor(
    private purchaseWishlistRepository: PurchaseWishlistRepository,
  ) {}

  async execute({
    userId,
  }: GetUserPurchaseWishlistUseCaseRequest): Promise<GetUserPurchaseWishlistUseCaseResponse> {
    const items =
      await this.purchaseWishlistRepository.findManyByUserId(userId);

    return { items };
  }
}
