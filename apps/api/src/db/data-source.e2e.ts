import "reflect-metadata";
import { DataSource } from "typeorm";
import env from "@life-os/env";
import { User } from "@/db/entities/user.entity";
import { Account } from "@/db/entities/account.entity";
import { Session } from "@/db/entities/session.entity";
import { Habit } from "@/db/entities/habit.entity";
import { Entry } from "@/db/entities/entry.entity";
import { Work } from "@/db/entities/work.entity";
import { BookDetail } from "@/db/entities/book-detail.entity";
import { CourseDetail } from "@/db/entities/course-detail.entity";
import { MovieDetail } from "@/db/entities/movie-detail.entity";
import { ArticleDetail } from "./entities/article-detail.entity";
import { PurchaseWishlist } from "@/db/entities/purchase-wishlist.entity";
import { VideoDetail } from "@/db/entities/video-detail.entity";

export const TestDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  dropSchema: true,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Account,
    Session,
    Habit,
    Entry,
    Work,
    BookDetail,
    CourseDetail,
    MovieDetail,
    ArticleDetail,
    PurchaseWishlist,
    VideoDetail,
  ],
});

/**
 * Wraps TestDataSource.initialize() with a guard: dropSchema wipes the
 * entire schema on init, so refuse to run unless DATABASE_URL is clearly a
 * disposable test database (see .env.test) rather than a dev/prod one that
 * happened to leak in via an env override.
 */
export async function initializeTestDataSource() {
  const dbName = new URL(env.DATABASE_URL).pathname.replace(/^\//, "");
  if (!dbName.includes("test")) {
    throw new Error(
      `Refusing to run e2e tests against database "${dbName}": TestDataSource ` +
        `drops its entire schema on init. Expected a database name containing ` +
        `"test" (check .env.test's DATABASE_URL, and don't override DATABASE_URL ` +
        `manually when running e2e tests).`,
    );
  }

  await TestDataSource.initialize();
}
