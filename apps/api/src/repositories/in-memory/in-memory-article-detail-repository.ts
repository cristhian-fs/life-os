import type { ArticleDetail } from "@/db/entities/article-detail.entity";
import type {
  ArticleDetailRepository,
  CreateArticleDetailInput,
} from "@/repositories/article-detail-repository";

export class InMemoryArticleDetailRepository
  implements ArticleDetailRepository
{
  public items: ArticleDetail[] = [];

  async create(data: CreateArticleDetailInput): Promise<ArticleDetail> {
    const articleDetail: ArticleDetail = {
      work_id: data.work_id,
      source_name: data.source_name ?? null,
      reading_time_minutes: data.reading_time_minutes ?? null,
      published_at: data.published_at ? new Date(data.published_at) : null,
    } as ArticleDetail;

    this.items.push(articleDetail);
    return articleDetail;
  }

  async findByWorkId(workId: string): Promise<ArticleDetail | null> {
    return this.items.find((item) => item.work_id === workId) ?? null;
  }

  async save(articleDetail: ArticleDetail): Promise<ArticleDetail> {
    const index = this.items.findIndex(
      (item) => item.work_id === articleDetail.work_id,
    );

    if (index === -1)
      throw new Error(
        `Cannot save article detail ${articleDetail.work_id}: not found in repository`,
      );

    this.items[index] = articleDetail;
    return articleDetail;
  }
}
