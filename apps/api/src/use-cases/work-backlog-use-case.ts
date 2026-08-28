import type {
  DateRange,
  WorkAnalyticsRepository,
} from "@/repositories/work-analytics-repository";

interface WorkBacklogUseCaseRequest {
  userId: string;
  range: DateRange;
  bucketUnit: "day" | "week" | "month";
}

interface WorkBacklogUseCaseResponse {
  data: Array<{ bucket_start: Date; bucket_end: Date; count: number }>;
}

export class WorkBacklogUseCase {
  constructor(private workAnalyticsRepository: WorkAnalyticsRepository) {}

  async execute({
    userId,
    range,
    bucketUnit,
  }: WorkBacklogUseCaseRequest): Promise<WorkBacklogUseCaseResponse> {
    const data = await this.workAnalyticsRepository.countBacklogByBucket(
      userId,
      range,
      bucketUnit,
    );

    return { data };
  }
}
