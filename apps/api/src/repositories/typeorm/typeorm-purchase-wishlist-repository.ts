import type { DataSource, DeepPartial, Repository } from "typeorm";
import { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type {
  CreatePurchaseWishlistInput,
  PurchaseWishlistRepository,
} from "@/repositories/purchase-wishlist-repository";

export class TypeORMPurchaseWishlistRepository implements PurchaseWishlistRepository {
  protected readonly repo: Repository<PurchaseWishlist>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(PurchaseWishlist);
  }
  async delete(purchaseWishlistId: string): Promise<void> {
    await this.repo.delete({ id: purchaseWishlistId });
  }
  async create(
    purchaseWishlist: CreatePurchaseWishlistInput,
  ): Promise<PurchaseWishlist> {
    const data = await this.repo.save(
      this.repo.create({ ...purchaseWishlist }),
    );

    return data;
  }
  async findById(purchaseWishlistId: string): Promise<PurchaseWishlist | null> {
    const data = await this.repo.findOneBy({ id: purchaseWishlistId });

    if (!data) return null;

    return data;
  }
  async findManyByUserId(userId: string): Promise<PurchaseWishlist[]> {
    const data = await this.repo.find({
      where: { user_id: userId },
      relations: {
        work: true,
      },
    });

    return data;
  }
  async save(purchaseWishlist: PurchaseWishlist): Promise<PurchaseWishlist> {
    const existing = await this.findById(purchaseWishlist.id);
    if (!existing) {
      throw new Error(
        `Cannot save purchaseWishlist ${purchaseWishlist.id}: not found in repository`,
      );
    }
    const merged = this.repo.merge(
      existing,
      purchaseWishlist as DeepPartial<PurchaseWishlist>,
    );
    return this.repo.save(merged);
  }
}
