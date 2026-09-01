import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryWorkRepository } from "@/repositories/in-memory/in-memory-work-repository";
import { makeWork } from "@/test/factories";
import { DeleteUserWorkUseCase } from "./delete-user-work";

let worksRepository: InMemoryWorkRepository;
let sut: DeleteUserWorkUseCase;

describe("Delete User Work Use Case", () => {
  beforeEach(() => {
    worksRepository = new InMemoryWorkRepository();
    sut = new DeleteUserWorkUseCase(worksRepository);
  });

  it("should be able to delete an user work item", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01" }),
    );

    const { success } = await sut.execute({
      userId: "user_01",
      workId: work.id,
    });

    expect(success).toBeTruthy();
    expect(await worksRepository.findById(work.id)).toBeNull();
  });

  it("should not delete a work item that belongs to another user", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01" }),
    );

    const result = await sut.execute({
      userId: "user_02",
      workId: work.id,
    });

    expect(result).toEqual({ success: false, reason: "forbidden" });
    expect(await worksRepository.findById(work.id)).not.toBeNull();
  });

  it("should return not_found when the work item does not exist", async () => {
    const result = await sut.execute({
      userId: "user_01",
      workId: "non-existing-id",
    });

    expect(result).toEqual({ success: false, reason: "not_found" });
  });
});
