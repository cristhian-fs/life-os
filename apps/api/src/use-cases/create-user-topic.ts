import type { Topic } from "@/db/entities/topic.entity";
import type {
  CreateTopicInput,
  TopicRepository,
} from "@/repositories/topic-repository";

interface CreateUserTopicUseCaseRequest {
  userId: string;
  payload: Omit<CreateTopicInput, "user_id">;
}

interface CreateUserTopicUseCaseResponse {
  topic: Topic;
}

export class CreateUserTopicUseCase {
  constructor(private topicsRepository: TopicRepository) {}

  async execute({
    userId,
    payload,
  }: CreateUserTopicUseCaseRequest): Promise<CreateUserTopicUseCaseResponse> {
    const topic = await this.topicsRepository.create({
      ...payload,
      user_id: userId,
    });

    return { topic };
  }
}
