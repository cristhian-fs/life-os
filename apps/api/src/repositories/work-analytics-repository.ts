import type { WorkType } from "@/db/entities/work.entity";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface WorkAnalyticsRepository {
  // RF: consumed work items by period and type
  countCompletedByBucket(
    userId: string,
    range: DateRange,
    bucketUnit: "day" | "week" | "month",
    type?: WorkType,
  ): Promise<
    Array<{
      bucket_start: Date;
      bucket_end: Date;
      type: WorkType;
      count: number;
    }>
  >;

  // RF: backlog volume (items to_consume) at each time point
  countBacklogByBucket(
    userId: string,
    range: DateRange,
    bucketUnit: "day" | "week" | "month",
  ): Promise<Array<{ bucket_start: Date; bucket_end: Date; count: number }>>;

  // RF: conversion funnel (entered -> in_progress -> completed/abandoned)
  countByStatusFunnel(
    userId: string,
    range: DateRange,
  ): Promise<{
    entered: number;
    in_progress: number;
    completed: number;
    abandoned: number;
  }>;

  // RF: avg items per month (totla completed / months in range)
  countCompletedInRange(
    userId: string,
    range: DateRange,
    type?: WorkType,
  ): Promise<number | null>;

  // RF: avg "stopped on wishlist" time (created_at -> started_at)
  getAvgWishlistWaitTimeSeconds(
    userId: string,
    range: DateRange,
    type?: WorkType,
  ): Promise<number | null>;
}
