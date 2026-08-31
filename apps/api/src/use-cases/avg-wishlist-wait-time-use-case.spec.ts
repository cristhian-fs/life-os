import { beforeEach, describe, expect, it } from "vitest";
import { WorkType } from "@/db/entities/work.entity";
import { InMemoryWorkAnalyticsRepository } from "@/repositories/in-memory/in-memory-work-analytics-repository";
import { makeWorkEntity } from "@/test/factories";
import { AvgWishlistWaitTimeUseCase } from "./avg-wishlist-wait-time-use-case";

let workAnalyticsRepository: InMemoryWorkAnalyticsRepository;
let sut: AvgWishlistWaitTimeUseCase;

const range = { from: new Date("2026-01-01"), to: new Date("2026-01-31") };

describe("Avg Wishlist Wait Time Use Case", () => {
  beforeEach(() => {
    workAnalyticsRepository = new InMemoryWorkAnalyticsRepository();
    sut = new AvgWishlistWaitTimeUseCase(workAnalyticsRepository);
  });

  it("should average the wait between created_at and started_at", async () => {
    workAnalyticsRepository.items.push(
      // waited 5 days
      makeWorkEntity({
        user_id: "user_01",
        created_at: new Date("2026-01-01"),
        started_at: new Date("2026-01-06"),
      }),
      // waited 10 days
      makeWorkEntity({
        user_id: "user_01",
        created_at: new Date("2026-01-01"),
        started_at: new Date("2026-01-11"),
      }),
    );

    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toBe(((5 + 10) / 2) * 24 * 60 * 60);
  });

  it("should ignore works that haven't started yet", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({ user_id: "user_01", started_at: null }),
    );

    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toBeNull();
  });

  it("should return null when nothing matches", async () => {
    const { data } = await sut.execute({ userId: "user_01", range });

    expect(data).toBeNull();
  });

  it("should filter by work type when provided", async () => {
    workAnalyticsRepository.items.push(
      makeWorkEntity({
        user_id: "user_01",
        type: WorkType.BOOK,
        created_at: new Date("2026-01-01"),
        started_at: new Date("2026-01-06"),
      }),
      makeWorkEntity({
        user_id: "user_01",
        type: WorkType.MOVIE,
        created_at: new Date("2026-01-01"),
        started_at: new Date("2026-01-31"),
      }),
    );

    const { data } = await sut.execute({
      userId: "user_01",
      range,
      type: WorkType.BOOK,
    });

    expect(data).toBe(5 * 24 * 60 * 60);
  });
});
