import type { BookDetail } from "@/db/entities/book-detail.entity";
import type {
  BookDetailRepository,
  CreateBookDetailInput,
} from "@/repositories/book-detail-repository";

export class InMemoryBookDetailRepository implements BookDetailRepository {
  public items: BookDetail[] = [];

  async create(data: CreateBookDetailInput): Promise<BookDetail> {
    const bookDetail: BookDetail = {
      work_id: data.work_id,
      isbn: data.isbn ?? null,
      pages: data.pages ?? null,
      publisher: data.publisher ?? null,
    } as BookDetail;

    this.items.push(bookDetail);
    return bookDetail;
  }

  async findByWorkId(workId: string): Promise<BookDetail | null> {
    return this.items.find((item) => item.work_id === workId) ?? null;
  }

  async save(bookDetail: BookDetail): Promise<BookDetail> {
    const index = this.items.findIndex(
      (item) => item.work_id === bookDetail.work_id,
    );

    if (index === -1)
      throw new Error(
        `Cannot save book detail ${bookDetail.work_id}: not found in repository`,
      );

    this.items[index] = bookDetail;
    return bookDetail;
  }
}
