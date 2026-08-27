import type { DataSource, DeepPartial, Repository } from "typeorm";
import { ArticleDetail } from "@/db/entities/article-detail.entity";
import type {
  ArticleDetailRepository,
  CreateArticleDetailInput,
} from "@/repositories/article-detail-repository";

export class TypeORMArticleDetailRepository
  implements ArticleDetailRepository
{
  protected readonly repo: Repository<ArticleDetail>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(ArticleDetail);
  }
  async create(data: CreateArticleDetailInput): Promise<ArticleDetail> {
    const entity = this.repo.create({
      work_id: data.work_id,
      source_name: data.source_name ?? undefined,
      reading_time_minutes: data.reading_time_minutes,
      published_at: data.published_at ? new Date(data.published_at) : null,
    } as DeepPartial<ArticleDetail>);

    return this.repo.save(entity);
  }
  async findByWorkId(workId: string): Promise<ArticleDetail | null> {
    return this.repo.findOneBy({ work_id: workId });
  }
  async save(articleDetail: ArticleDetail): Promise<ArticleDetail> {
    const existing = await this.repo.findOneBy({
      work_id: articleDetail.work_id,
    });
    if (!existing) {
      throw new Error(
        `Cannot save article detail ${articleDetail.work_id}: not found in repository`,
      );
    }
    const merged = this.repo.merge(
      existing,
      articleDetail as DeepPartial<ArticleDetail>,
    );
    return this.repo.save(merged);
  }
}
