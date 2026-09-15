import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788964159653 implements MigrationInterface {
    name = 'Migration1788964159653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" ADD "body" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN "body"`);
    }

}
