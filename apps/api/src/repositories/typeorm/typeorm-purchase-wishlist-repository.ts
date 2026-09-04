import type { DataSource, DeepPartial, Repository } from "typeorm";
import { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import type {
  CreatedByMonthCount,
  CreatePurchaseWishlistInput,
  PendingWishlistSummary,
  PurchasedByMonthCount,
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
  async getPendingSummary(userId: string): Promise<PendingWishlistSummary> {
    const row = await this.repo
      .createQueryBuilder("purchase_wishlist")
      .select("COUNT(*)", "count")
      .addSelect("COALESCE(SUM(estimated_price_in_cents), 0)", "total")
      .where("purchase_wishlist.user_id = :userId", { userId })
      .andWhere("purchase_wishlist.purchased_at IS NULL")
      .getRawOne<{ count: string; total: string }>();

    return {
      count: Number(row?.count ?? 0),
      totalEstimatedCents: Number(row?.total ?? 0),
    };
  }

  async countCreatedByMonth(
    userId: string,
    year: number,
  ): Promise<CreatedByMonthCount> {
    const rows = await this.repo
      .createQueryBuilder("pw")
      .select("date_trunc('month', pw.created_at)", "month")
      .addSelect("COUNT(*)", "count")
      .where("pw.user_id = :userId", { userId })
      .andWhere("EXTRACT(YEAR FROM pw.created_at) = :year", { year })
      .groupBy("date_trunc('month', pw.created_at)")
      .orderBy("month", "ASC")
      .getRawMany<{ month: Date; count: string }>();

    return rows.map((row) => ({ month: row.month, count: Number(row.count) }));
  }

  async countPurchasedByMonth(
    userId: string,
    year: number,
  ): Promise<PurchasedByMonthCount> {
    const rows = await this.repo
      .createQueryBuilder("pw")
      .select("date_trunc('month', pw.purchased_at)", "month")
      .addSelect("COUNT(*)", "count")
      .where("pw.user_id = :userId", { userId })
      .andWhere("EXTRACT(YEAR FROM pw.purchased_at) = :year", { year })
      .groupBy("date_trunc('month', pw.purchased_at)")
      .orderBy("month", "ASC")
      .getRawMany<{ month: Date; count: string }>();

    return rows.map((row) => ({ month: row.month, count: Number(row.count) }));
  }
}
