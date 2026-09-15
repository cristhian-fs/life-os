import type { Topic } from "@/db/entities/topic.entity";
import type { TopicRepository } from "@/repositories/topic-repository";
import type { UpdateTopicInput } from "@/schemas/topics.schema";

interface UpdateUserTopicUseCaseRequest {
  userId: string;
  topicId: string;
  payload: UpdateTopicInput;
}

interface UpdateUserTopicUseCaseResponse {
  topic: Topic | null;
}

export class UpdateUserTopicUseCase {
  constructor(private topicsRepository: TopicRepository) {}

  async execute({
    userId,
    topicId,
    payload,
  }: UpdateUserTopicUseCaseRequest): Promise<UpdateUserTopicUseCaseResponse> {
    const topic = await this.topicsRepository.findById(topicId);

    if (!topic || topic.user_id !== userId) {
      return { topic: null };
    }

    const updated = await this.topicsRepository.save({ ...topic, ...payload });

    return { topic: updated };
  }
}
