import type { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type { PurchaseWishlistRepository } from "@/repositories/purchase-wishlist-repository";
import type { WorkRepository } from "@/repositories/work-repository";

export interface UpdatePurchaseWishlistInput {
  work_id?: string | null;
  title?: string | null;
  estimated_price_in_cents?: number | null;
  currency?: string | null;
  image_url?: string | null;
  store_or_url?: string;
  purchased_at?: string | null;
}

interface UpdatePurchaseWishlistUseCaseRequest {
  userId: string;
  purchaseWishlistId: string;
  payload: UpdatePurchaseWishlistInput;
}

type UpdatePurchaseWishlistUseCaseResponse =
  | { success: true; data: PurchaseWishlist }
  | {
      success: false;
      data: null;
      reason: "not_found" | "forbidden" | "work_not_found" | "work_forbidden";
    };

export class UpdatePurchaseWishlistUseCase {
  constructor(
    private purchaseWishlistRepository: PurchaseWishlistRepository,
    private worksRepository: WorkRepository,
  ) {}

  async execute({
    userId,
    purchaseWishlistId,
    payload,
  }: UpdatePurchaseWishlistUseCaseRequest): Promise<UpdatePurchaseWishlistUseCaseResponse> {
    const item =
      await this.purchaseWishlistRepository.findById(purchaseWishlistId);

    if (!item) {
      return { success: false, data: null, reason: "not_found" };
    }
    if (item.user_id !== userId) {
      return { success: false, data: null, reason: "forbidden" };
    }

    if (payload.work_id) {
      const work = await this.worksRepository.findById(payload.work_id);

      if (!work) {
        return { success: false, data: null, reason: "work_not_found" };
      }
      if (work.user_id !== userId) {
        return { success: false, data: null, reason: "work_forbidden" };
      }
    }

    const { purchased_at, ...rest } = payload;

    const updated = await this.purchaseWishlistRepository.save({
      ...item,
      ...rest,
      ...(purchased_at !== undefined && {
        purchased_at: purchased_at ? new Date(purchased_at) : null,
      }),
    });

    return { success: true, data: updated };
  }
}
