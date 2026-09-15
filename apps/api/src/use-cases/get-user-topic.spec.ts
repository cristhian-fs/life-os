import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTopicRepository } from "@/repositories/in-memory/in-memory-topic-repository";
import { GetUserTopicUseCase } from "./get-user-topic";
import { makeTopic } from "@/test/factories";

let topicsRepository: InMemoryTopicRepository;
let sut: GetUserTopicUseCase;

describe("Get User Topic Use Case", () => {
  beforeEach(async () => {
    topicsRepository = new InMemoryTopicRepository();
    sut = new GetUserTopicUseCase(topicsRepository);
  });

  it("should be able to get a topic by id", async () => {
    const topicInMemory = await topicsRepository.create(
      makeTopic({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_01",
      topicId: topicInMemory.id,
    });

    expect(result).toEqual(
      expect.objectContaining({ success: true, data: topicInMemory }),
    );
  });

  it("should return not_found for a topic that does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      topicId: "non-existent-id",
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "not_found",
    });
  });

  it("should return forbidden for a topic that belongs to another user", async () => {
    const topicInMemory = await topicsRepository.create(
      makeTopic({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_02",
      topicId: topicInMemory.id,
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "forbidden",
    });
  });
});
