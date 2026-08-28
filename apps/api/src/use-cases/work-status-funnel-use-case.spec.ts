import { beforeEach, describe, expect, it } from "vitest";
import { WorkStatus } from "@/db/entities/work.entity";
import { InMemoryWorkAnalyticsRepository } from "@/repositories/in-memory/in-memory-work-analytics-repository";
import { makeWorkEntity } from "@/test/factories";
import { WorkStatusFunnelUseCase } from "./work-status-funnel-use-case";

let workAnalyticsRepository: InMemoryWorkAnalyticsRepository;
let sut: WorkStatusFunnelUseCase;

const range = { from: new Date("2026-01-01"), to: new Date("2026-01-31") };

describe("Work Status Funnel Use Case", () => {
  beforeEach(() => {
    workAnalyticsRepository = new InMemoryWorkAnalyticsRepository();
    sut = new WorkStatusFunnelUseCase(workAnalyticsRepository);
  });

  it("should count works entered in range by status", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.TO_CONSUME,
        created_at: new Date("2026-01-05"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.IN_PROGRESS,
        created_at: new Date("2026-01-06"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        created_at: new Date("2026-01-07"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        created_at: new Date("2026-01-08"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.ABANDONED,
        created_at: new Date("2026-01-09"),
      }),
    );

    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toEqual({
      entered: 1,
      in_progress: 1,
      completed: 2,
      abandoned: 1,
    });
  });

  it("should ignore works created outside the range", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.TO_CONSUME,
        created_at: new Date("2025-12-01"),
      }),
    );

    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toEqual({
      entered: 0,
      in_progress: 0,
      completed: 0,
      abandoned: 0,
    });
  });

  it("should not count works belonging to another user", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_02",
        status: WorkStatus.TO_CONSUME,
        created_at: new Date("2026-01-05"),
      }),
    );

    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toEqual({
      entered: 0,
      in_progress: 0,
      completed: 0,
      abandoned: 0,
    });
  });
});
