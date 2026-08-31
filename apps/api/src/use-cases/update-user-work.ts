import { WorkType } from "@/db/entities/work.entity";
import type { Work } from "@/db/entities/work.entity";
import type { DetailRepository } from "@/repositories/detail-repository";
import type { WorkDetailRepositories } from "@/repositories/work-detail-repositories";
import type { WorkRepository } from "@/repositories/work-repository";
import type { UpdateDetailInput, UpdateWorkInput } from "@/schemas/work.schema";

interface UpdateUserWorkUseCaseRequest {
  userId: string;
  workId: string;
  payload: UpdateWorkInput;
}

interface UpdateUserWorkUseCaseResponse {
  work: Work | null;
}

// Which of UpdateDetailInput's flattened fields actually belong to each
// type's detail table — everything else sent for that type is ignored.
const DETAIL_FIELDS_BY_TYPE: Record<WorkType, readonly (keyof UpdateDetailInput)[]> = {
  [WorkType.BOOK]: ["isbn", "pages", "publisher"],
  [WorkType.MOVIE]: ["runtime_minutes", "director"],
  [WorkType.ARTICLE]: ["source_name", "reading_time_minutes", "published_at"],
  [WorkType.COURSE]: ["platform", "instructor", "duration_hours"],
  [WorkType.VIDEO]: ["platform", "duration_minutes"],
};

function pickDetailFields(type: WorkType, detail: UpdateDetailInput) {
  const fields = DETAIL_FIELDS_BY_TYPE[type];
  const picked: Record<string, unknown> = {};

  for (const field of fields) {
    if (detail[field] !== undefined) picked[field] = detail[field];
  }
  // published_at is the only Date-typed detail column — the schema carries
  // it as an ISO string like started_at/completed_at.
  if ("published_at" in picked) {
    picked.published_at = picked.published_at
      ? new Date(picked.published_at as string)
      : null;
  }

  return picked;
}

export class UpdateUserWorkUseCase {
  constructor(
    private worksRepository: WorkRepository,
    private detailRepositories: WorkDetailRepositories,
  ) {}

  async execute({
    userId,
    workId,
    payload,
  }: UpdateUserWorkUseCaseRequest): Promise<UpdateUserWorkUseCaseResponse> {
    const work = await this.worksRepository.findById(workId);

    if (!work || work.user_id !== userId) {
      return { work: null };
    }

    const { started_at, completed_at, detail, ...rest } = payload;

    const updated = await this.worksRepository.save({
      ...work,
      ...rest,
      ...(started_at !== undefined && {
        started_at: started_at ? new Date(started_at) : null,
      }),
      ...(completed_at !== undefined && {
        completed_at: completed_at ? new Date(completed_at) : null,
      }),
    });

    if (detail) {
      const picked = pickDetailFields(work.type, detail);

      if (Object.keys(picked).length > 0) {
        // Cast: the concrete detail shape is only known at runtime (work.type)
        // — TS can't narrow it from a dynamic key the way CreateWorkUseCase's
        // generic <T extends CreateWorkInput> does.
        const detailRepo = this.detailRepositories[work.type] as unknown as DetailRepository<
          Record<string, unknown>,
          Record<string, unknown>
        >;
        const existingDetail = await detailRepo.findByWorkId(work.id);

        if (existingDetail) {
          await detailRepo.save({ ...existingDetail, ...picked });
        } else {
          await detailRepo.create({ work_id: work.id, ...picked });
        }
      }
    }

    return { work: updated };
  }
}
