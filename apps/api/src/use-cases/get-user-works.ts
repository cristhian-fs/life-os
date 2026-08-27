import type { Work } from "@/db/entities/work.entity";
import type { WorkDetailRepositories } from "@/repositories/work-detail-repositories";
import type { WorkRepository } from "@/repositories/work-repository";

interface GetUserWorksUseCaseRequest {
  userId: string;
}

interface GetUserWorksUseCaseResponse {
  works: Work[];
}

export class GetUserWorksUseCase {
  constructor(
    private worksRepository: WorkRepository,
    private detailRepositories: WorkDetailRepositories,
  ) {}

  async execute({
    userId,
  }: GetUserWorksUseCaseRequest): Promise<GetUserWorksUseCaseResponse> {
    const works = await this.worksRepository.findManyByUserId(userId);

    const withDetails = await Promise.all(
      works.map(async (work) => {
        const detailRepo = this.detailRepositories[work.type];
        const detail = await detailRepo.findByWorkId(work.id);
        const relationKey = `${work.type}Detail` as const;

        return { ...work, [relationKey]: detail } as Work;
      }),
    );

    return { works: withDetails };
  }
}
