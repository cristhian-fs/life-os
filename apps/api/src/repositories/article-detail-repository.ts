import type { ArticleDetail } from "@/db/entities/article-detail.entity";
import type { DetailRepository } from "./detail-repository";

export type CreateArticleDetailInput = {
  work_id: string;
  source_name?: string | null;
  reading_time_minutes?: number | null;
  published_at?: string | null;
};

export interface ArticleDetailRepository extends DetailRepository<
  ArticleDetail,
  CreateArticleDetailInput
> {}
