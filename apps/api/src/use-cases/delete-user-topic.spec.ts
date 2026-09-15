import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTopicRepository } from "@/repositories/in-memory/in-memory-topic-repository";
import { DeleteUserTopicUseCase } from "./delete-user-topic";
import { makeTopic } from "@/test/factories";

let topicsRepository: InMemoryTopicRepository;
let sut: DeleteUserTopicUseCase;

describe("Delete User Topic Use Case", () => {
  beforeEach(async () => {
    topicsRepository = new InMemoryTopicRepository();
    sut = new DeleteUserTopicUseCase(topicsRepository);
  });

  it("should be able to delete a user topic", async () => {
    const topic = await topicsRepository.create(
      makeTopic({ user_id: "user_01" }),
    );

    const { success } = await sut.execute({
      userId: "user_01",
      topicId: topic.id,
    });

    expect(success).toBeTruthy();
  });

  it("should not delete a topic that belongs to another user", async () => {
    const topic = await topicsRepository.create(
      makeTopic({ user_id: "user_01" }),
    );

    const { success } = await sut.execute({
      userId: "user_02",
      topicId: topic.id,
    });

    expect(success).toBeFalsy();
  });

  it("should return not found when the topic does not exist", async () => {
    const { success } = await sut.execute({
      userId: "user_01",
      topicId: "non-existing-id",
    });

    expect(success).toBeFalsy();
  });
});
