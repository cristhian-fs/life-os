import type { BookDetail } from "@/db/entities/book-detail.entity";
import type { DetailRepository } from "./detail-repository";

export type CreateBookDetailInput = {
  work_id: string;
  isbn?: string | null;
  pages?: number | null;
  publisher?: string | null;
};

export interface BookDetailRepository extends DetailRepository<
  BookDetail,
  CreateBookDetailInput
> {}
