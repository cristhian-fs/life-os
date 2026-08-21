import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { makeEntry } from "@/test/factories";
import { DeleteUserEntryUseCase } from "./delete-user-entry";

let entriesRepository: InMemoryEntryRepository;
let sut: DeleteUserEntryUseCase;

describe("Delete User Entry Use Case", () => {
  beforeEach(async () => {
    entriesRepository = new InMemoryEntryRepository();
    sut = new DeleteUserEntryUseCase(entriesRepository);
  });

  it("should be able to delete an user entry", async () => {
    const entry = await entriesRepository.create(
      makeEntry({ user_id: "user_01" }),
    );

    const { success } = await sut.execute({
      userId: "user_01",
      entryId: entry.id,
    });

    expect(success).toBeTruthy();

    const stored = await entriesRepository.findById(entry.id);
    expect(stored).toBeNull();
  });

  it("should not delete an entry that belongs to another user", async () => {
    const entry = await entriesRepository.create(
      makeEntry({ user_id: "user_01" }),
    );

    const { success } = await sut.execute({
      userId: "user_02",
      entryId: entry.id,
    });

    expect(success).toBeFalsy();
  });

  it("should return false when the entry does not exist", async () => {
    const { success } = await sut.execute({
      userId: "user_01",
      entryId: "non-existing-id",
    });

    expect(success).toBeFalsy();
  });
});
