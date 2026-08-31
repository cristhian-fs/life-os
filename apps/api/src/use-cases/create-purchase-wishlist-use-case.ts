import type { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type {
  CreatePurchaseWishlistInput,
  PurchaseWishlistRepository,
} from "@/repositories/purchase-wishlist-repository";
import type { WorkRepository } from "@/repositories/work-repository";

interface CreatePurchaseWishListUseCaseRequest {
  userId: string;
  payload: CreatePurchaseWishlistInput;
}

type CreatePurchaseWishlistUseCaseResponse =
  | { success: true; data: PurchaseWishlist; reason?: undefined }
  | {
      success: false;
      data?: undefined;
      reason: "work_not_found" | "forbidden";
    };

export class CreatePurchaseWishlistUseCase {
  constructor(
    private purchaseWishlistRepository: PurchaseWishlistRepository,
    private worksRepository: WorkRepository,
  ) {}

  async execute({
    userId,
    payload,
  }: CreatePurchaseWishListUseCaseRequest): Promise<CreatePurchaseWishlistUseCaseResponse> {
    if (payload.work_id) {
      const work = await this.worksRepository.findById(payload.work_id);

      if (!work) {
        return { success: false, reason: "work_not_found" };
      }

      if (work.user_id !== userId) {
        return { success: false, reason: "forbidden" };
      }
    }

    const wishlistItem = await this.purchaseWishlistRepository.create({
      user_id: userId,
      work_id: payload.work_id ?? null,
      title: payload.title,
      estimated_price_in_cents: payload.estimated_price_in_cents,
      currency: payload.currency,
      store_or_url: payload.store_or_url,
    });

    return { success: true, data: wishlistItem };
  }
}
