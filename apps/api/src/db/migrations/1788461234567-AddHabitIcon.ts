import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddHabitIcon1788461234567 implements MigrationInterface {
  name = "AddHabitIcon1788461234567";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "habit" ADD "icon" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "habit" DROP COLUMN "icon"`);
  }
}
