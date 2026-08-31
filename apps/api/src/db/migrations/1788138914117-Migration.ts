import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788138914117 implements MigrationInterface {
    name = 'Migration1788138914117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "video_detail" ("work_id" uuid NOT NULL, "platform" text, "duration_minutes" integer, CONSTRAINT "PK_fdd054c06451727020fbfcde65e" PRIMARY KEY ("work_id"))`);
        await queryRunner.query(`ALTER TYPE "public"."work_type_enum" ADD VALUE 'video'`);
        await queryRunner.query(`ALTER TABLE "video_detail" ADD CONSTRAINT "FK_fdd054c06451727020fbfcde65e" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video_detail" DROP CONSTRAINT "FK_fdd054c06451727020fbfcde65e"`);
        await queryRunner.query(`CREATE TYPE "public"."work_type_enum_old" AS ENUM('book', 'movie', 'course', 'article')`);
        await queryRunner.query(`ALTER TABLE "work" ALTER COLUMN "type" TYPE "public"."work_type_enum_old" USING "type"::"text"::"public"."work_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."work_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."work_type_enum_old" RENAME TO "work_type_enum"`);
        await queryRunner.query(`DROP TABLE "video_detail"`);
    }

}
