import { beforeEach, describe, expect, it } from "vitest";
import { WorkStatus, WorkType } from "@/db/entities/work.entity";
import { InMemoryWorkAnalyticsRepository } from "@/repositories/in-memory/in-memory-work-analytics-repository";
import { makeWorkEntity } from "@/test/factories";
import { CompletedWorksCountUseCase } from "./completed-works-count-use-case";

let workAnalyticsRepository: InMemoryWorkAnalyticsRepository;
let sut: CompletedWorksCountUseCase;

const range = { from: new Date("2026-01-01"), to: new Date("2026-01-31") };

describe("Completed Works Count Use Case", () => {
  beforeEach(() => {
    workAnalyticsRepository = new InMemoryWorkAnalyticsRepository();
    sut = new CompletedWorksCountUseCase(workAnalyticsRepository);
  });

  it("should count works completed within the range", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        completed_at: new Date("2026-01-10"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        completed_at: new Date("2026-01-20"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.COMPLETED,
        completed_at: new Date("2025-12-15"), // outside range
      }),
      makeWorkEntity({
        user_id: "user_01",
        status: WorkStatus.IN_PROGRESS, // not completed
      }),
    );

    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toBe(2);
  });

  it("should filter by work type when provided", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        type: WorkType.BOOK,
        status: WorkStatus.COMPLETED,
        completed_at: new Date("2026-01-10"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        type: WorkType.MOVIE,
        status: WorkStatus.COMPLETED,
        completed_at: new Date("2026-01-10"),
      }),
    );

    const { data } = await sut.execute({
      userId: "user_01",
      range,
      type: WorkType.BOOK,
    });

    expect(data).toBe(1);
  });

  it("should return 0 when nothing was completed in range", async () => {
    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toBe(0);
  });
});
