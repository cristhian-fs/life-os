import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787758591059 implements MigrationInterface {
    name = 'Migration1787758591059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."work_type_enum" AS ENUM('book', 'movie', 'course')`);
        await queryRunner.query(`CREATE TYPE "public"."work_status_enum" AS ENUM('to_consume', 'in_progress', 'completed', 'abandoned')`);
        await queryRunner.query(`CREATE TABLE "work" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "type" "public"."work_type_enum" NOT NULL, "title" text NOT NULL, "creator" text NOT NULL, "status" "public"."work_status_enum" NOT NULL, "rating" integer, "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "summary" text, "external_url" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_f1e091bce9dd2beb2eb8b11a74" CHECK ("rating" >= 0 AND "rating" <= 5), CONSTRAINT "PK_1ad2a9dfd058d66c37e6d495222" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_detail" ("work_id" uuid NOT NULL, "isbn" text, "pages" integer, "publisher" text, CONSTRAINT "PK_9e2d90e496c1631e6a184da1201" PRIMARY KEY ("work_id"))`);
        await queryRunner.query(`CREATE TABLE "course_detail" ("work_id" uuid NOT NULL, "platform" text, "instructor" text, "duration_hours" double precision, CONSTRAINT "PK_46ab2b83846140a6295e446ef8a" PRIMARY KEY ("work_id"))`);
        await queryRunner.query(`CREATE TABLE "movie_detail" ("work_id" uuid NOT NULL, "runtime_minutes" integer, "director" text, CONSTRAINT "PK_e39fbebb40c179de94dbaf7a580" PRIMARY KEY ("work_id"))`);
        await queryRunner.query(`ALTER TABLE "work" ADD CONSTRAINT "FK_0147ac31ef55db00564894750e1" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_detail" ADD CONSTRAINT "FK_9e2d90e496c1631e6a184da1201" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_detail" ADD CONSTRAINT "FK_46ab2b83846140a6295e446ef8a" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movie_detail" ADD CONSTRAINT "FK_e39fbebb40c179de94dbaf7a580" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movie_detail" DROP CONSTRAINT "FK_e39fbebb40c179de94dbaf7a580"`);
        await queryRunner.query(`ALTER TABLE "course_detail" DROP CONSTRAINT "FK_46ab2b83846140a6295e446ef8a"`);
        await queryRunner.query(`ALTER TABLE "book_detail" DROP CONSTRAINT "FK_9e2d90e496c1631e6a184da1201"`);
        await queryRunner.query(`ALTER TABLE "work" DROP CONSTRAINT "FK_0147ac31ef55db00564894750e1"`);
        await queryRunner.query(`DROP TABLE "movie_detail"`);
        await queryRunner.query(`DROP TABLE "course_detail"`);
        await queryRunner.query(`DROP TABLE "book_detail"`);
        await queryRunner.query(`DROP TABLE "work"`);
        await queryRunner.query(`DROP TYPE "public"."work_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."work_type_enum"`);
    }

}
