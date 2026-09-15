import type { Topic } from "@/db/entities/topic.entity";
import type { TopicRepository } from "@/repositories/topic-repository";

interface GetUserTopicUseCaseRequest {
  userId: string;
  topicId: string;
}

type GetUserTopicUseCaseResponse =
  | { success: true; data: Topic }
  | { success: false; data: null; reason: "not_found" | "forbidden" };

export class GetUserTopicUseCase {
  constructor(private topicsRepository: TopicRepository) {}

  async execute({
    userId,
    topicId,
  }: GetUserTopicUseCaseRequest): Promise<GetUserTopicUseCaseResponse> {
    const topic = await this.topicsRepository.findById(topicId);

    if (!topic) {
      return {
        success: false,
        data: null,
        reason: "not_found",
      };
    }
    if (topic.user_id !== userId) {
      return {
        success: false,
        data: null,
        reason: "forbidden",
      };
    }

    return { success: true, data: topic };
  }
}
