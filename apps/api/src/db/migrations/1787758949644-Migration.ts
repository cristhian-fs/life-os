import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787758949644 implements MigrationInterface {
    name = 'Migration1787758949644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "article_detail" ("work_id" uuid NOT NULL, "source_name" text NOT NULL, "reading_time_minutes" integer, "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f89730a0ba31dc7af412359d7dc" PRIMARY KEY ("work_id"))`);
        await queryRunner.query(`ALTER TABLE "article_detail" ADD CONSTRAINT "FK_f89730a0ba31dc7af412359d7dc" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_detail" DROP CONSTRAINT "FK_f89730a0ba31dc7af412359d7dc"`);
        await queryRunner.query(`DROP TABLE "article_detail"`);
    }

}
