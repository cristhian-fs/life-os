import type { Topic } from "@/db/entities/topic.entity";
import type { TopicRepository } from "@/repositories/topic-repository";

interface GetUserTopicsUseCaseRequest {
  userId: string;
}

interface GetUserTopicsUseCaseResponse {
  topics: Topic[];
}

export class GetUserTopicsUseCase {
  constructor(private topicsRepository: TopicRepository) {}

  async execute({
    userId,
  }: GetUserTopicsUseCaseRequest): Promise<GetUserTopicsUseCaseResponse> {
    const topics = await this.topicsRepository.findManyByUserId(userId);

    return {
      topics,
    };
  }
}
