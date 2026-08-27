import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787775402158 implements MigrationInterface {
    name = 'Migration1787775402158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work" ADD "image_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work" DROP COLUMN "image_url"`);
    }

}
