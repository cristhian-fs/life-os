import type { ArticleDetail } from "@/db/entities/article-detail.entity";
import type { BookDetail } from "@/db/entities/book-detail.entity";
import type { CourseDetail } from "@/db/entities/course-detail.entity";
import type { MovieDetail } from "@/db/entities/movie-detail.entity";
import type { VideoDetail } from "@/db/entities/video-detail.entity";
import { type Work, WorkType } from "@/db/entities/work.entity";
import type { WorkResponse } from "@/schemas/work.schema";

type WorkDetail =
  | BookDetail
  | MovieDetail
  | ArticleDetail
  | CourseDetail
  | VideoDetail;

function presentDetail(
  type: WorkType,
  detail: WorkDetail | null,
): WorkResponse["detail"] {
  if (!detail) return null;

  switch (type) {
    case WorkType.BOOK: {
      const { isbn, pages, publisher } = detail as BookDetail;
      return { isbn, pages, publisher };
    }
    case WorkType.MOVIE: {
      const { runtime_minutes, director } = detail as MovieDetail;
      return { runtime_minutes, director };
    }
    case WorkType.ARTICLE: {
      const { source_name, reading_time_minutes, published_at } =
        detail as ArticleDetail;
      return {
        source_name,
        reading_time_minutes,
        published_at: published_at?.toISOString() ?? null,
      };
    }
    case WorkType.COURSE: {
      const { platform, instructor, duration_hours } = detail as CourseDetail;
      return { platform, instructor, duration_hours };
    }
    case WorkType.VIDEO: {
      const { platform, duration_minutes } = detail as VideoDetail;
      return { platform, duration_minutes };
    }
  }
}

export class WorkPresenter {
  static toHTTP(work: Work, detail: WorkDetail | null = null): WorkResponse {
    return {
      id: work.id,
      user_id: work.user_id,
      type: work.type,
      title: work.title,
      creator: work.creator,
      status: work.status,
      rating: work.rating,
      started_at: work.started_at?.toISOString() ?? null,
      completed_at: work.completed_at?.toISOString() ?? null,
      summary: work.summary,
      external_url: work.external_url,
      image_url: work.image_url,
      created_at: work.created_at.toISOString(),
      updated_at: work.updated_at.toISOString(),
      detail: presentDetail(work.type, detail),
    };
  }

  /** Presents a Work whose relation (bookDetail/movieDetail/...) was already loaded, as GetUserWorksUseCase returns. */
  static fromRelations(work: Work): WorkResponse {
    const detail =
      work.bookDetail ??
      work.movieDetail ??
      work.articleDetail ??
      work.courseDetail ??
      work.videoDetail ??
      null;

    return WorkPresenter.toHTTP(work, detail);
  }

  static toHTTPList(works: Work[]): WorkResponse[] {
    return works.map(WorkPresenter.fromRelations);
  }
}
