import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTopicRepository } from "@/repositories/in-memory/in-memory-topic-repository";
import { GetUserTopicTreeUseCase } from "./get-user-topic-tree";
import { makeTopic } from "@/test/factories";

let topicsRepository: InMemoryTopicRepository;
let sut: GetUserTopicTreeUseCase;

describe("Get User Topic Tree Use Case", () => {
  beforeEach(async () => {
    topicsRepository = new InMemoryTopicRepository();
    sut = new GetUserTopicTreeUseCase(topicsRepository);
  });

  it("should return the root plus every descendant", async () => {
    const root = await topicsRepository.create(
      makeTopic({ user_id: "user_01", title: "Algorithms" }),
    );
    const child = await topicsRepository.create(
      makeTopic({
        user_id: "user_01",
        title: "Sorting",
        parent_topic_id: root.id,
      }),
    );
    const grandchild = await topicsRepository.create(
      makeTopic({
        user_id: "user_01",
        title: "Quicksort",
        parent_topic_id: child.id,
      }),
    );
    // unrelated topic, should not appear in the tree
    await topicsRepository.create(
      makeTopic({ user_id: "user_01", title: "Databases" }),
    );

    const result = await sut.execute({
      userId: "user_01",
      rootTopicId: root.id,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(
      expect.arrayContaining([root, child, grandchild]),
    );
    expect(result.data).toHaveLength(3);
  });

  it("should return only the root when it has no children", async () => {
    const root = await topicsRepository.create(
      makeTopic({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_01",
      rootTopicId: root.id,
    });

    expect(result).toEqual(expect.objectContaining({ success: true, data: [root] }));
  });

  it("should return not_found when the root topic does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      rootTopicId: "non-existent-id",
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "not_found",
    });
  });

  it("should return forbidden when the root topic belongs to another user", async () => {
    const root = await topicsRepository.create(
      makeTopic({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_02",
      rootTopicId: root.id,
    });

    expect(result).toEqual({
      success: false,
      data: null,
      reason: "forbidden",
    });
  });
});
