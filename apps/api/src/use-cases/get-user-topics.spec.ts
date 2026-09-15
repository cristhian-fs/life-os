import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTopicRepository } from "@/repositories/in-memory/in-memory-topic-repository";
import { GetUserTopicsUseCase } from "./get-user-topics";
import { makeTopic } from "@/test/factories";

let topicsRepository: InMemoryTopicRepository;
let sut: GetUserTopicsUseCase;

describe("Get User Topics Use Case", () => {
  beforeEach(async () => {
    topicsRepository = new InMemoryTopicRepository();
    sut = new GetUserTopicsUseCase(topicsRepository);
  });

  it("should be able to list topics for a user", async () => {
    await topicsRepository.create(makeTopic({ user_id: "user_01" }));
    await topicsRepository.create(makeTopic({ user_id: "user_01" }));
    await topicsRepository.create(makeTopic({ user_id: "user_02" }));

    const { topics } = await sut.execute({ userId: "user_01" });

    expect(topics).toHaveLength(2);
    expect(topics.every((topic) => topic.user_id === "user_01")).toBe(true);
  });

  it("should return an empty list when the user has no topics", async () => {
    const { topics } = await sut.execute({ userId: "user_01" });

    expect(topics).toEqual([]);
  });
});
