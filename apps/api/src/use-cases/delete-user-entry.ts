import type { EntryRepository } from "@/repositories/entry-repository";

interface DeleteUserEntryUseCaseRequest {
  userId: string;
  entryId: string;
}

type DeleteUserEntryUseCaseResponse =
  | { success: true }
  | { success: false; reason: "not_found" | "forbidden" };

export class DeleteUserEntryUseCase {
  constructor(private entriesRepository: EntryRepository) {}

  async execute({
    userId,
    entryId,
  }: DeleteUserEntryUseCaseRequest): Promise<DeleteUserEntryUseCaseResponse> {
    const entry = await this.entriesRepository.findById(entryId);

    if (!entry) {
      return { success: false, reason: "not_found" };
    }
    if (userId !== entry.user_id) {
      return { success: false, reason: "forbidden" };
    }

    await this.entriesRepository.delete(entryId);

    return { success: true };
  }
}
