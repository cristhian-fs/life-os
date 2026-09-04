import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseWishlistImageUrl1788461235567
  implements MigrationInterface
{
  name = "AddPurchaseWishlistImageUrl1788461235567";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase_wishlist" ADD "image_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase_wishlist" DROP COLUMN "image_url"`,
    );
  }
}
