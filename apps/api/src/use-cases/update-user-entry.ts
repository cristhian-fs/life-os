import type { Entry } from "@/db/entities/entry.entity";
import type { EntryRepository } from "@/repositories/entry-repository";
import type { UpdateEntryInput } from "@/schemas/entries.schema";

// UpdateEntryInput.date is a string (it comes straight off the HTTP schema) —
// the entity column is a Date, so the use-case boundary takes the parsed form.
type UpdateEntryPayload = Omit<UpdateEntryInput, "date"> & { date?: Date };

interface UpdateUserEntryUseCaseRequest {
  userId: string;
  entryId: string;
  payload: UpdateEntryPayload;
}

interface UpdateUserEntryUseCaseResponse {
  entry: Entry | null;
}

export class UpdateUserEntryUseCase {
  constructor(private entriesRepository: EntryRepository) {}

  async execute({
    userId,
    entryId,
    payload,
  }: UpdateUserEntryUseCaseRequest): Promise<UpdateUserEntryUseCaseResponse> {
    const entry = await this.entriesRepository.findById(entryId);

    if (!entry || entry.user_id !== userId) {
      return { entry: null };
    }

    const updated = await this.entriesRepository.update({
      ...entry,
      ...payload,
    });

    return { entry: updated };
  }
}
