import type { WorkType } from "@/db/entities/work.entity";
import type {
  DateRange,
  WorkAnalyticsRepository,
} from "@/repositories/work-analytics-repository";

interface AvgWishlistWaitTimeUseCaseRequest {
  userId: string;
  range: DateRange;
  type?: WorkType;
}

interface AvgWishlistWaitTimeUseCaseResponse {
  data: number | null;
}

export class AvgWishlistWaitTimeUseCase {
  constructor(private workAnalyticsRepository: WorkAnalyticsRepository) {}

  async execute({
    userId,
    range,
    type,
  }: AvgWishlistWaitTimeUseCaseRequest): Promise<AvgWishlistWaitTimeUseCaseResponse> {
    const data = await this.workAnalyticsRepository.getAvgWishlistWaitTimeSeconds(
      userId,
      range,
      type,
    );

    return { data };
  }
}
