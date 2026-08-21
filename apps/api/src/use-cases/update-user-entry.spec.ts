import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryEntryRepository } from "@/repositories/in-memory/in-memory-entry-repository";
import { makeEntry } from "@/test/factories";
import { UpdateUserEntryUseCase } from "./update-user-entry";

let entriesRepository: InMemoryEntryRepository;
let sut: UpdateUserEntryUseCase;

describe("Update User Entry Use Case", () => {
  beforeEach(async () => {
    entriesRepository = new InMemoryEntryRepository();
    sut = new UpdateUserEntryUseCase(entriesRepository);
  });

  it("should be able to update an user entry", async () => {
    const entry = await entriesRepository.create(
      makeEntry({ user_id: "user_01" }),
    );

    const { entry: updated } = await sut.execute({
      userId: "user_01",
      entryId: entry.id,
      payload: { note: "felt great", value_numeric: 42 },
    });

    expect(updated).toEqual(
      expect.objectContaining({ note: "felt great", value_numeric: 42 }),
    );
  });

  it("should not update an entry that belongs to another user", async () => {
    const entry = await entriesRepository.create(
      makeEntry({ user_id: "user_01" }),
    );

    const { entry: updated } = await sut.execute({
      userId: "user_02",
      entryId: entry.id,
      payload: { note: "hijacked" },
    });

    expect(updated).toBeNull();
  });

  it("should return null when the entry does not exist", async () => {
    const { entry } = await sut.execute({
      userId: "user_01",
      entryId: "non-existing-id",
      payload: { note: "anything" },
    });

    expect(entry).toBeNull();
  });
});
