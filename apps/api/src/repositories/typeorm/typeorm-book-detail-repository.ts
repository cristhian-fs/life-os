import type { DataSource, DeepPartial, Repository } from "typeorm";
import { BookDetail } from "@/db/entities/book-detail.entity";
import type {
  BookDetailRepository,
  CreateBookDetailInput,
} from "@/repositories/book-detail-repository";

export class TypeORMBookDetailRepository implements BookDetailRepository {
  protected readonly repo: Repository<BookDetail>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(BookDetail);
  }
  async create(bookDetail: CreateBookDetailInput): Promise<BookDetail> {
    const data = await this.repo.save(this.repo.create(bookDetail));

    return data;
  }
  async findByWorkId(workId: string): Promise<BookDetail | null> {
    return this.repo.findOneBy({ work_id: workId });
  }
  async save(bookDetail: BookDetail): Promise<BookDetail> {
    const existing = await this.repo.findOneBy({
      work_id: bookDetail.work_id,
    });
    if (!existing) {
      throw new Error(
        `Cannot save book detail ${bookDetail.work_id}: not found in repository`,
      );
    }
    const merged = this.repo.merge(existing, bookDetail as DeepPartial<BookDetail>);
    return this.repo.save(merged);
  }
}
