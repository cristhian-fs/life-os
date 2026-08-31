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
    VideoDetail,
  ],
});
