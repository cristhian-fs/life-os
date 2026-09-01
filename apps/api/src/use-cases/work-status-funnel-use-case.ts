import type {
  DateRange,
  WorkAnalyticsRepository,
} from "@/repositories/work-analytics-repository";

interface WorkStatusFunnelUseCaseRequest {
  userId: string;
  range: DateRange;
}

interface WorkStatusFunnelUseCaseResponse {
  data: {
    entered: number;
    in_progress: number;
    completed: number;
    abandoned: number;
  };
}

export class WorkStatusFunnelUseCase {
  constructor(private workAnalyticsRepository: WorkAnalyticsRepository) {}

  async execute({
    userId,
    range,
  }: WorkStatusFunnelUseCaseRequest): Promise<WorkStatusFunnelUseCaseResponse> {
    const data = await this.workAnalyticsRepository.countByStatusFunnel(
      userId,
      range,
    );

    return { data };
  }
}
