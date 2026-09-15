import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTopicRepository } from "@/repositories/in-memory/in-memory-topic-repository";
import { UpdateUserTopicUseCase } from "./update-user-topic";
import { makeTopic } from "@/test/factories";
import { TopicStatus } from "@/db/entities/topic.entity";

let topicsRepository: InMemoryTopicRepository;
let sut: UpdateUserTopicUseCase;

describe("Update User Topic Use Case", () => {
  beforeEach(async () => {
    topicsRepository = new InMemoryTopicRepository();
    sut = new UpdateUserTopicUseCase(topicsRepository);
  });

  it("should be able to update a topic", async () => {
    const topic = await topicsRepository.create(
      makeTopic({ user_id: "user_01", title: "Old title" }),
    );

    const { topic: updated } = await sut.execute({
      userId: "user_01",
      topicId: topic.id,
      payload: { title: "New title", status: TopicStatus.IN_PROGRESS },
    });

    expect(updated).toEqual(
      expect.objectContaining({
        title: "New title",
        status: TopicStatus.IN_PROGRESS,
      }),
    );
  });

  it("should return null when the topic does not exist", async () => {
    const { topic } = await sut.execute({
      userId: "user_01",
      topicId: "non-existing-id",
      payload: { title: "New title" },
    });

    expect(topic).toBeNull();
  });

  it("should return null when the topic belongs to another user", async () => {
    const existing = await topicsRepository.create(
      makeTopic({ user_id: "user_01" }),
    );

    const { topic } = await sut.execute({
      userId: "user_02",
      topicId: existing.id,
      payload: { title: "New title" },
    });

    expect(topic).toBeNull();
  });
});
