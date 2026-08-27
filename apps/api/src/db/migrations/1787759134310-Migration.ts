import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787759134310 implements MigrationInterface {
    name = 'Migration1787759134310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."work_type_enum" ADD VALUE 'article'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."work_type_enum_old" AS ENUM('book', 'movie', 'course')`);
        await queryRunner.query(`ALTER TABLE "work" ALTER COLUMN "type" TYPE "public"."work_type_enum_old" USING "type"::"text"::"public"."work_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."work_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."work_type_enum_old" RENAME TO "work_type_enum"`);
    }

}
