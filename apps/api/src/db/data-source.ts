import "reflect-metadata";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import path from "path";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// tsx runs this file as .ts directly (dev, migration:* scripts); the
// production build compiles it to .js — match whichever this actually is,
// so migration:run finds real files either way instead of silently matching zero.
const migrationExt = path.extname(__filename);

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  synchronize: false,
  migrations: [path.join(__dirname, `/migrations/**/*${migrationExt}`)],
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
