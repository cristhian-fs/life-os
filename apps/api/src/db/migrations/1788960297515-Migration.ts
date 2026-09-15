import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788960297515 implements MigrationInterface {
    name = 'Migration1788960297515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."topic_status_enum" AS ENUM('not_started', 'in_progress', 'mastered')`);
        await queryRunner.query(`CREATE TABLE "topic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "parent_topic_id" uuid, "title" text NOT NULL, "description" text, "status" "public"."topic_status_enum" NOT NULL, "order_index" integer, "work_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_33aa4ecb4e4f20aa0157ea7ef61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d6246b640ebd2a2886694d2367" ON "topic"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_06f497034c2c064825003581f7" ON "topic"  ("parent_topic_id") `);
        await queryRunner.query(`ALTER TABLE "topic" ADD CONSTRAINT "FK_d6246b640ebd2a2886694d2367c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "topic" ADD CONSTRAINT "FK_06f497034c2c064825003581f7e" FOREIGN KEY ("parent_topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "topic" ADD CONSTRAINT "FK_4a59bf458651a8253e4c74e026b" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" DROP CONSTRAINT "FK_4a59bf458651a8253e4c74e026b"`);
        await queryRunner.query(`ALTER TABLE "topic" DROP CONSTRAINT "FK_06f497034c2c064825003581f7e"`);
        await queryRunner.query(`ALTER TABLE "topic" DROP CONSTRAINT "FK_d6246b640ebd2a2886694d2367c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06f497034c2c064825003581f7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d6246b640ebd2a2886694d2367"`);
        await queryRunner.query(`DROP TABLE "topic"`);
        await queryRunner.query(`DROP TYPE "public"."topic_status_enum"`);
    }

}
