import { WorkStatus } from "@/db/entities/work.entity";
import { utcStartOfMonth } from "@/reports/date-buckets";
import type { WorkAnalyticsRepository } from "@/repositories/work-analytics-repository";

interface WorkConsumptionSummaryUseCaseRequest {
  userId: string;
}

interface WorkConsumptionSummaryUseCaseResponse {
  consumedThisMonth: number | null;
  backlogNow: number;
  inProgressNow: number;
}

export class WorkConsumptionSummaryUseCase {
  constructor(private workAnalyticsRepository: WorkAnalyticsRepository) {}

  async execute({
    userId,
  }: WorkConsumptionSummaryUseCaseRequest): Promise<WorkConsumptionSummaryUseCaseResponse> {
    const now = new Date();
    const monthRange = { from: utcStartOfMonth(now), to: now };

    const [consumedThisMonth, backlogNow, inProgressNow] = await Promise.all([
      this.workAnalyticsRepository.countCompletedInRange(userId, monthRange),
      this.workAnalyticsRepository.countByStatus(
        userId,
        WorkStatus.TO_CONSUME,
      ),
      this.workAnalyticsRepository.countByStatus(
        userId,
        WorkStatus.IN_PROGRESS,
      ),
    ]);

    return { consumedThisMonth, backlogNow, inProgressNow };
  }
}
