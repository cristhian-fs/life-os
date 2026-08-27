import { beforeEach, describe, expect, it } from "vitest";
import { WorkStatus, WorkType } from "@/db/entities/work.entity";
import { InMemoryWorkRepository } from "@/repositories/in-memory/in-memory-work-repository";
import { makeWork } from "@/test/factories";
import { UpdateUserWorkUseCase } from "./update-user-work";

let worksRepository: InMemoryWorkRepository;
let sut: UpdateUserWorkUseCase;

describe("Update User Work Use Case", () => {
  beforeEach(() => {
    worksRepository = new InMemoryWorkRepository();
    sut = new UpdateUserWorkUseCase(worksRepository);
  });

  it("should be able to update an user work item", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.BOOK }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { title: "Updated title", status: WorkStatus.COMPLETED, rating: 5 },
    });

    expect(updated).toEqual(
      expect.objectContaining({
        title: "Updated title",
        status: WorkStatus.COMPLETED,
        rating: 5,
      }),
    );
  });

  it("should be able to attach an image to an existing work item", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", image_url: null }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { image_url: "covers/updated-cover.png" },
    });

    expect(updated?.image_url).toBe("covers/updated-cover.png");
  });

  it("should be able to clear a work item's image", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", image_url: "covers/old-cover.png" }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { image_url: null },
    });

    expect(updated?.image_url).toBeNull();
  });

  it("should convert started_at/completed_at strings to dates", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01" }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: {
        started_at: "2024-01-01T00:00:00.000Z",
        completed_at: "2024-02-01T00:00:00.000Z",
      },
    });

    expect(updated?.started_at).toEqual(new Date("2024-01-01T00:00:00.000Z"));
    expect(updated?.completed_at).toEqual(new Date("2024-02-01T00:00:00.000Z"));
  });

  it("should not change the work item's type", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.BOOK }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { title: "New title" },
    });

    expect(updated?.type).toBe(WorkType.BOOK);
  });

  it("should not update a work item that belongs to another user", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01" }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_02",
      workId: work.id,
      payload: { title: "Hijacked" },
    });

    expect(updated).toBeNull();
  });

  it("should return null when the work item does not exist", async () => {
    const { work } = await sut.execute({
      userId: "user_01",
      workId: "non-existing-id",
      payload: { title: "Anything" },
    });

    expect(work).toBeNull();
  });
});
