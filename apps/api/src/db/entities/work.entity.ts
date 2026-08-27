import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import type { BookDetail } from "./book-detail.entity";
import type { MovieDetail } from "./movie-detail.entity";
import type { CourseDetail } from "./course-detail.entity";
import type { ArticleDetail } from "./article-detail.entity";

export enum WorkType {
  BOOK = "book",
  MOVIE = "movie",
  COURSE = "course",
  ARTICLE = "article",
}

export enum WorkStatus {
  TO_CONSUME = "to_consume",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
}

@Entity({ name: "work" })
export class Work {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  user_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Column({ type: "enum", enum: WorkType, name: "type" })
  type: WorkType;

  @Column({ type: "text", name: "title" })
  title: string;

  @Column({ type: "text", name: "creator" })
  creator: string;

  @Column({ type: "enum", enum: WorkStatus, name: "status" })
  status: WorkStatus;

  @Column({ type: "integer", name: "rating", nullable: true })
  @Check(`"rating" >= 0 AND "rating" <= 5`)
  rating: number | null;

  @Column({ type: "timestamptz", name: "started_at", nullable: true })
  started_at: Date | null;

  @Column({ type: "timestamptz", name: "completed_at", nullable: true })
  completed_at: Date | null;

  @Column({ type: "text", name: "summary", nullable: true })
  summary: string | null;

  @Column({ type: "text", name: "external_url", nullable: true })
  external_url: string | null;

  @Column({ type: "text", name: "image_url", nullable: true })
  image_url: string | null;

  @CreateDateColumn({
    type: "timestamptz",
    name: "created_at",
    default: () => "now()",
  })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updated_at: Date;

  @OneToOne("BookDetail", (bookDetail: BookDetail) => bookDetail.work)
  bookDetail?: BookDetail;

  @OneToOne("MovieDetail", (movieDetail: MovieDetail) => movieDetail.work)
  movieDetail?: MovieDetail;

  @OneToOne("CourseDetail", (courseDetail: CourseDetail) => courseDetail.work)
  courseDetail?: CourseDetail;

  @OneToOne(
    "ArticleDetail",
    (articleDetail: ArticleDetail) => articleDetail.work,
  )
  articleDetail?: ArticleDetail;
}
