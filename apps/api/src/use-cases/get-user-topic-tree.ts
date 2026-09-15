import type { Topic } from "@/db/entities/topic.entity";
import type { TopicRepository } from "@/repositories/topic-repository";

interface GetUserTopicTreeUseCaseRequest {
  userId: string;
  rootTopicId: string;
}

type GetUserTopicTreeUseCaseResponse =
  | { success: true; data: Topic[] }
  | { success: false; data: null; reason: "not_found" | "forbidden" };

export class GetUserTopicTreeUseCase {
  constructor(private topicsRepository: TopicRepository) {}

  async execute({
    userId,
    rootTopicId,
  }: GetUserTopicTreeUseCaseRequest): Promise<GetUserTopicTreeUseCaseResponse> {
    const root = await this.topicsRepository.findById(rootTopicId);

    if (!root) {
      return { success: false, data: null, reason: "not_found" };
    }
    if (root.user_id !== userId) {
      return { success: false, data: null, reason: "forbidden" };
    }

    const tree = await this.topicsRepository.findTreeByRootId(rootTopicId);

    return { success: true, data: tree };
  }
}
