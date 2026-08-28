import type { WorkType } from "@/db/entities/work.entity";
import type {
  DateRange,
  WorkAnalyticsRepository,
} from "@/repositories/work-analytics-repository";

interface CompletedWorksCountUseCaseRequest {
  userId: string;
  range: DateRange;
  type?: WorkType;
}

interface CompletedWorksCountUseCaseResponse {
  data: number | null;
}

export class CompletedWorksCountUseCase {
  constructor(private workAnalyticsRepository: WorkAnalyticsRepository) {}

  async execute({
    userId,
    range,
    type,
  }: CompletedWorksCountUseCaseRequest): Promise<CompletedWorksCountUseCaseResponse> {
    const data = await this.workAnalyticsRepository.countCompletedInRange(
      userId,
      range,
      type,
    );

    return { data };
  }
}
