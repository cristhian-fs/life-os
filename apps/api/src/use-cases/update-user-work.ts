import type { Work } from "@/db/entities/work.entity";
import type { WorkRepository } from "@/repositories/work-repository";
import type { UpdateWorkInput } from "@/schemas/work.schema";

interface UpdateUserWorkUseCaseRequest {
  userId: string;
  workId: string;
  payload: UpdateWorkInput;
}

interface UpdateUserWorkUseCaseResponse {
  work: Work | null;
}

export class UpdateUserWorkUseCase {
  constructor(private worksRepository: WorkRepository) {}

  async execute({
    userId,
    workId,
    payload,
  }: UpdateUserWorkUseCaseRequest): Promise<UpdateUserWorkUseCaseResponse> {
    const work = await this.worksRepository.findById(workId);

    if (!work || work.user_id !== userId) {
      return { work: null };
    }

    const { started_at, completed_at, ...rest } = payload;

    const updated = await this.worksRepository.save({
      ...work,
      ...rest,
      ...(started_at !== undefined && {
        started_at: started_at ? new Date(started_at) : null,
      }),
      ...(completed_at !== undefined && {
        completed_at: completed_at ? new Date(completed_at) : null,
      }),
    });

    return { work: updated };
  }
}
