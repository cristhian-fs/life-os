import type { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787176420008 implements MigrationInterface {
    name = 'Migration1787176420008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" text NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "emailVerified" boolean NOT NULL, "image" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" text NOT NULL, "userId" text NOT NULL, "accountId" text NOT NULL, "providerId" text NOT NULL, "accessToken" text, "refreshToken" text, "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "scope" text, "idToken" text, "password" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."habit_type_enum" AS ENUM('boolean', 'numeric')`);
        await queryRunner.query(`CREATE TYPE "public"."habit_goal_period_enum" AS ENUM('daily', 'weekly', 'monthly')`);
        await queryRunner.query(`CREATE TYPE "public"."habit_status_enum" AS ENUM('active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "habit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "name" text NOT NULL, "description" text, "type" "public"."habit_type_enum" NOT NULL, "unit" text, "goal_value" double precision DEFAULT '1', "goal_period" "public"."habit_goal_period_enum" NOT NULL, "status" "public"."habit_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "archived_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_71654d5d0512043db43bac9abfc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "entry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "habit_id" uuid NOT NULL, "date" date NOT NULL, "value_boolean" boolean, "value_numeric" double precision, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_a58c675c4c129a8e0f63d3676d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "session" ("id" text NOT NULL, "userId" text NOT NULL, "token" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "ipAddress" text, "userAgent" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE ("token"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "habit" ADD CONSTRAINT "FK_c4f8df95aa32fa50c2b150772f1" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry" ADD CONSTRAINT "FK_13290f54efdc9f5564c58847d74" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry" ADD CONSTRAINT "FK_eab846566ea4da92942887bfeae" FOREIGN KEY ("habit_id") REFERENCES "habit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`ALTER TABLE "entry" DROP CONSTRAINT "FK_eab846566ea4da92942887bfeae"`);
        await queryRunner.query(`ALTER TABLE "entry" DROP CONSTRAINT "FK_13290f54efdc9f5564c58847d74"`);
        await queryRunner.query(`ALTER TABLE "habit" DROP CONSTRAINT "FK_c4f8df95aa32fa50c2b150772f1"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_60328bf27019ff5498c4b977421"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "entry"`);
        await queryRunner.query(`DROP TABLE "habit"`);
        await queryRunner.query(`DROP TYPE "public"."habit_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."habit_goal_period_enum"`);
        await queryRunner.query(`DROP TYPE "public"."habit_type_enum"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
