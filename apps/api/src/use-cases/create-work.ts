import type { ArticleDetail } from "@/db/entities/article-detail.entity";
import type { BookDetail } from "@/db/entities/book-detail.entity";
import type { CourseDetail } from "@/db/entities/course-detail.entity";
import type { MovieDetail } from "@/db/entities/movie-detail.entity";
import type { Work } from "@/db/entities/work.entity";
import type { WorkDetailRepositories } from "@/repositories/work-detail-repositories";
import type { WorkRepository } from "@/repositories/work-repository";
import type { CreateWorkInput } from "@/schemas/work.schema";

interface CreateUserWorkUseCaseRequest<T extends CreateWorkInput> {
  userId: string;
  payload: T;
}

interface WorkDetailMap {
  book: BookDetail;
  movie: MovieDetail;
  article: ArticleDetail;
  course: CourseDetail;
}

export type CreateWorkUseCaseResponse<
  T extends CreateWorkInput["type"] = CreateWorkInput["type"],
> = {
  work: Work;
  detail: WorkDetailMap[T];
};

export class CreateWorkUseCase {
  constructor(
    private worksRepository: WorkRepository,
    private detailRepositories: WorkDetailRepositories,
  ) {}

  async execute<T extends CreateWorkInput>({
    userId,
    payload,
  }: CreateUserWorkUseCaseRequest<T>): Promise<
    CreateWorkUseCaseResponse<T["type"]>
  > {
    const work = await this.worksRepository.create({
      user_id: userId,
      type: payload.type,
      title: payload.title,
      creator: payload.creator,
      status: payload.status,
      external_url: payload.external_url ?? null,
      image_url: payload.image_url ?? null,
    });

    const detailRepo = this.detailRepositories[payload.type];
    const detail = await detailRepo.create({
      work_id: work.id,
      ...payload.detail,
    });

    return { work, detail } as CreateWorkUseCaseResponse<T["type"]>;
  }
}
