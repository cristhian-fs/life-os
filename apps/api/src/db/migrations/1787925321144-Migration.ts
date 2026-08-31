import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787925321144 implements MigrationInterface {
  name = "Migration1787925321144";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "purchase_wishlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "work_id" uuid, "title" text, "estimated_price_in_cents" integer, "currency" text, "store_or_url" text NOT NULL, "purchased_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_47561706b86a6e5dcf73dfc2992" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_wishlist" ADD CONSTRAINT "FK_a6b6f41d215dc831f27689a58f8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_wishlist" ADD CONSTRAINT "FK_25b7ce151b83d0705ffc6a76e7b" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase_wishlist" DROP CONSTRAINT "FK_25b7ce151b83d0705ffc6a76e7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_wishlist" DROP CONSTRAINT "FK_a6b6f41d215dc831f27689a58f8"`,
    );
    await queryRunner.query(`DROP TABLE "purchase_wishlist"`);
  }
}
