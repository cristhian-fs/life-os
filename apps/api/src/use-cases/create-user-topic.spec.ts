import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTopicRepository } from "@/repositories/in-memory/in-memory-topic-repository";
import { CreateUserTopicUseCase } from "./create-user-topic";

let topicsRepository: InMemoryTopicRepository;
let sut: CreateUserTopicUseCase;

describe("Create User Topic Use Case", () => {
  beforeEach(async () => {
    topicsRepository = new InMemoryTopicRepository();
    sut = new CreateUserTopicUseCase(topicsRepository);
  });

  it("should be able to create a topic", async () => {
    const { topic } = await sut.execute({
      userId: "user_01",
      payload: {
        title: "Recursion",
        description: "Recursion description",
        parent_topic_id: null,
        order_index: 1,
      },
    });

    expect(topic).toEqual(
      expect.objectContaining({ title: "Recursion", user_id: "user_01" }),
    );

    const topicInMemory = await topicsRepository.findById(topic.id);

    expect(topicInMemory).toEqual(
      expect.objectContaining({ title: "Recursion", user_id: "user_01" }),
    );
  });
});
