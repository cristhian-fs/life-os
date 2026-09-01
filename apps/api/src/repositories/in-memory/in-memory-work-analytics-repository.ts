import {
  WorkStatus,
  type Work,
  type WorkType,
} from "@/db/entities/work.entity";
import type {
  DateRange,
  WorkAnalyticsRepository,
} from "../work-analytics-repository";
import {
  addDays,
  addMonths,
  addWeeks,
  startOfDay,
  min as minDate,
  startOfMonth,
  startOfWeek,
  subMilliseconds,
} from "date-fns";

export function getBucketStart(
  date: Date,
  bucketUnit: "day" | "week" | "month",
): Date {
  if (bucketUnit === "day") return startOfDay(date);
  if (bucketUnit === "week") return startOfWeek(date, { weekStartsOn: 1 }); // monday
  return startOfMonth(date);
}

export function getBucketEnd(
  bucketStart: Date,
  bucketUnit: "day" | "week" | "month",
  rangeEnd: Date,
): Date {
  const nextBucketStart =
    bucketUnit === "day"
      ? addDays(bucketStart, 1)
      : bucketUnit === "week"
        ? addWeeks(bucketStart, 1)
        : addMonths(bucketStart, 1);

  const bucketEnd = subMilliseconds(nextBucketStart, 1);
  return minDate([bucketEnd, rangeEnd]);
}

export class InMemoryWorkAnalyticsRepository implements WorkAnalyticsRepository {
  public items: Work[] = [];

  async countBacklogByBucket(
    userId: string,
    range: DateRange,
    bucketUnit: "day" | "week" | "month",
  ): Promise<Array<{ bucket_start: Date; bucket_end: Date; count: number }>> {
    const relevant = this.items.filter((work) => {
      if (work.user_id !== userId) return false;
      if (work.status !== WorkStatus.TO_CONSUME) return false;
      if (work.created_at < range.from || work.created_at > range.to)
        return false;
      return true;
    });

    const buckets = new Map<
      string,
      { bucket_start: Date; type: WorkType; count: number }
    >();

    for (const work of relevant) {
      const bucketStart = getBucketStart(work.created_at, bucketUnit);
      const key = `${bucketStart.toISOString()}`;

      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, {
          bucket_start: bucketStart,
          type: work.type,
          count: 1,
        });
      }
    }

    return Array.from(buckets.values())
      .map((bucket) => ({
        bucket_start: bucket.bucket_start,
        bucket_end: getBucketEnd(bucket.bucket_start, bucketUnit, range.to),
        count: bucket.count,
      }))
      .sort((a, b) => a.bucket_start.getTime() - b.bucket_start.getTime());
  }

  async countByStatusFunnel(
    userId: string,
    range: DateRange,
  ): Promise<{
    entered: number;
    in_progress: number;
    completed: number;
    abandoned: number;
  }> {
    const relevant = this.items.filter((work) => {
      if (work.user_id !== userId) return false;
      if (work.created_at < range.from || work.created_at > range.to)
        return false;
      return true;
    });

    const countByStatus = relevant.reduce(
      (acc, curr) => {
        if (curr.status === WorkStatus.IN_PROGRESS) acc.in_progress++;
        if (curr.status === WorkStatus.COMPLETED) acc.completed++;
        if (curr.status === WorkStatus.ABANDONED) acc.abandoned++;
        if (curr.status === WorkStatus.TO_CONSUME) acc.entered++;

        return acc;
      },
      {
        entered: 0,
        in_progress: 0,
        completed: 0,
        abandoned: 0,
      },
    );

    return countByStatus;
  }

  async countCompletedByBucket(
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
  > {
    const relevant = this.items.filter((work) => {
      if (work.user_id !== userId) return false;
      if (work.status !== WorkStatus.COMPLETED) return false;
      if (!work.completed_at) return false;
      if (work.completed_at < range.from || work.completed_at > range.to)
        return false;
      if (type && work.type !== type) return false;
      return true;
    });

    const buckets = new Map<
      string,
      { bucket_start: Date; type: WorkType; count: number }
    >();

    for (const work of relevant) {
      const bucketStart = getBucketStart(work.completed_at!, bucketUnit);
      const key = `${bucketStart.toISOString()}::${work.type}`;

      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, {
          bucket_start: bucketStart,
          type: work.type,
          count: 1,
        });
      }
    }

    return Array.from(buckets.values())
      .map((bucket) => ({
        bucket_start: bucket.bucket_start,
        bucket_end: getBucketEnd(bucket.bucket_start, bucketUnit, range.to),
        type: bucket.type,
        count: bucket.count,
      }))
      .sort((a, b) => a.bucket_start.getTime() - b.bucket_start.getTime());
  }

  async countCompletedInRange(
    userId: string,
    range: DateRange,
    type?: WorkType,
  ): Promise<number | null> {
    const relevant = this.items.filter((work) => {
      if (work.user_id !== userId) return false;
      if (work.status !== WorkStatus.COMPLETED) return false;
      if (!work.completed_at) return false;
      if (work.completed_at < range.from || work.completed_at > range.to)
        return false;
      if (type && work.type !== type) return false;
      return true;
    });

    return relevant.length;
  }

  async getAvgWishlistWaitTimeSeconds(
    userId: string,
    range: DateRange,
    type?: WorkType,
  ): Promise<number | null> {
    const relevant = this.items.filter((work) => {
      if (work.user_id !== userId) return false;
      if (!work.started_at) return false;
      if (work.started_at < range.from || work.started_at > range.to)
        return false;
      if (type && work.type !== type) return false;
      return true;
    });

    if (!relevant.length) return null;

    const totalSeconds = relevant.reduce((sum, work) => {
      const waitMs = work.started_at!.getTime() - work.created_at.getTime();
      return sum + waitMs / 1000;
    }, 0);

    return totalSeconds / relevant.length;
  }

  async countByStatus(userId: string, status: WorkStatus): Promise<number> {
    return this.items.filter(
      (work) => work.user_id === userId && work.status === status,
    ).length;
  }
}
