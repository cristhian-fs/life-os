import type { ArticleDetail } from "@/db/entities/article-detail.entity";
import type { BookDetail } from "@/db/entities/book-detail.entity";
import type { CourseDetail } from "@/db/entities/course-detail.entity";
import type { MovieDetail } from "@/db/entities/movie-detail.entity";
import type { CreateArticleDetailInput } from "@/repositories/article-detail-repository";
import type { CreateBookDetailInput } from "@/repositories/book-detail-repository";
import type { CreateCourseDetailInput } from "@/repositories/course-detail-repository";
import type { DetailRepository } from "@/repositories/detail-repository";
import type { CreateMovieDetailInput } from "@/repositories/movie-detail-repository";

/** One detail repository per WorkType, keyed the same way Work.type is stored. */
export interface WorkDetailRepositories {
  book: DetailRepository<BookDetail, CreateBookDetailInput>;
  movie: DetailRepository<MovieDetail, CreateMovieDetailInput>;
  article: DetailRepository<ArticleDetail, CreateArticleDetailInput>;
  course: DetailRepository<CourseDetail, CreateCourseDetailInput>;
}
