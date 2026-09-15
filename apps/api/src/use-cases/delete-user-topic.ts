import type { TopicRepository } from "@/repositories/topic-repository";

interface DeleteUserTopicUseCaseRequest {
  userId: string;
  topicId: string;
}

type DeleteUserTopicUseCaseResponse =
  | { success: true }
  | { success: false; reason: "not_found" | "forbidden" };

export class DeleteUserTopicUseCase {
  constructor(private topicsRepository: TopicRepository) {}

  async execute({
    userId,
    topicId,
  }: DeleteUserTopicUseCaseRequest): Promise<DeleteUserTopicUseCaseResponse> {
    const topic = await this.topicsRepository.findById(topicId);

    if (!topic) {
      return { success: false, reason: "not_found" };
    }
    if (userId !== topic.user_id) {
      return { success: false, reason: "forbidden" };
    }

    await this.topicsRepository.delete(topicId);

    return { success: true };
  }
}
