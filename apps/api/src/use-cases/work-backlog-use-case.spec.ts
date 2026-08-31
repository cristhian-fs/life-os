import { beforeEach, describe, expect, it } from "vitest";
import { WorkStatus } from "@/db/entities/work.entity";
import { InMemoryWorkAnalyticsRepository } from "@/repositories/in-memory/in-memory-work-analytics-repository";
import { makeWorkEntity } from "@/test/factories";
import { WorkBacklogUseCase } from "./work-backlog-use-case";

let workAnalyticsRepository: InMemoryWorkAnalyticsRepository;
let sut: WorkBacklogUseCase;

const range = { from: new Date("2026-01-01"), to: new Date("2026-01-31") };

describe("Work Backlog Use Case", () => {
  beforeEach(() => {
    workAnalyticsRepository = new InMemoryWorkAnalyticsRepository();
    sut = new WorkBacklogUseCase(workAnalyticsRepository);
  });

  it("should bucket backlog items by when they entered the backlog", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.TO_CONSUME,
        created_at: new Date("2026-01-06"), // Monday
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.TO_CONSUME,
        created_at: new Date("2026-01-07"), // same week (Mon 01-06 .. Sun 01-12)
      }),
    );

    const { data } = await sut.execute({
      userId: "user_01",
      range,
      bucketUnit: "week",
    });

    expect(data).toEqual([expect.objectContaining({ count: 2 })]);
  });

  it("should not count items that already left the backlog", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        created_at: new Date("2026-01-05"),
      }),
    );

    const { data } = await sut.execute({
      userId: "user_01",
      range,
      bucketUnit: "week",
    });

    expect(data).toEqual([]);
  });

  it("should not count backlog items from another user", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_02",
        status: WorkStatus.TO_CONSUME,
        created_at: new Date("2026-01-05"),
      }),
    );

    const { data } = await sut.execute({
      userId: "user_01",
      range,
      bucketUnit: "week",
    });

    expect(data).toEqual([]);
  });
});
