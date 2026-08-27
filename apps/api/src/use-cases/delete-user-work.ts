import type { WorkRepository } from "@/repositories/work-repository";

interface DeleteUserWorkUseCaseRequest {
  userId: string;
  workId: string;
}

type DeleteUserWorkUseCaseResponse =
  | { success: true }
  | { success: false; reason: "not_found" | "forbidden" };

export class DeleteUserWorkUseCase {
  constructor(private worksRepository: WorkRepository) {}

  async execute({
    userId,
    workId,
  }: DeleteUserWorkUseCaseRequest): Promise<DeleteUserWorkUseCaseResponse> {
    const work = await this.worksRepository.findById(workId);

    if (!work) {
      return { success: false, reason: "not_found" };
    }
    if (userId !== work.user_id) {
      return { success: false, reason: "forbidden" };
    }

    await this.worksRepository.delete(workId);

    return { success: true };
  }
}
