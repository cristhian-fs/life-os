import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788436365386 implements MigrationInterface {
  name = "Migration1788436365386";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit" ADD "active_weekdays" integer array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit" DROP COLUMN "active_weekdays"`,
    );
  }
}
