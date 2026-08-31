import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorkStatus } from "@/db/entities/work.entity";
import { InMemoryWorkAnalyticsRepository } from "@/repositories/in-memory/in-memory-work-analytics-repository";
import { makeWorkEntity } from "@/test/factories";
import { WorkConsumptionSummaryUseCase } from "./work-consumption-summary-use-case";

let workAnalyticsRepository: InMemoryWorkAnalyticsRepository;
let sut: WorkConsumptionSummaryUseCase;

const NOW = new Date("2026-01-14T00:00:00.000Z");

describe("Work Consumption Summary Use Case", () => {
  beforeEach(() => {
    workAnalyticsRepository = new InMemoryWorkAnalyticsRepository();
    sut = new WorkConsumptionSummaryUseCase(workAnalyticsRepository);
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts items completed since the start of this month, current backlog, and current in-progress", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        completed_at: new Date("2026-01-05T00:00:00.000Z"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        completed_at: new Date("2025-12-20T00:00:00.000Z"), // last month, excluded
      }),
      makeWorkEntity({ user_id: "user_01", status: WorkStatus.TO_CONSUME }),
      makeWorkEntity({ user_id: "user_01", status: WorkStatus.TO_CONSUME }),
      makeWorkEntity({ user_id: "user_01", status: WorkStatus.IN_PROGRESS }),
      makeWorkEntity({ user_id: "user_02", status: WorkStatus.TO_CONSUME }), // other user, excluded
    );

    const { consumedThisMonth, backlogNow, inProgressNow } =
      await sut.execute({ userId: "user_01" });

    expect(consumedThisMonth).toBe(1);
    expect(backlogNow).toBe(2);
    expect(inProgressNow).toBe(1);
  });

  it("returns zeros when the user has no work items", async () => {
    const result = await sut.execute({ userId: "user_01" });

    expect(result).toEqual({
      consumedThisMonth: 0,
      backlogNow: 0,
      inProgressNow: 0,
    });
  });
});
