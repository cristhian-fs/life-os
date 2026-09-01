import { Work, WorkStatus, WorkType } from "@/db/entities/work.entity";
import type { DataSource, Repository } from "typeorm";
import type {
  DateRange,
  WorkAnalyticsRepository,
} from "../work-analytics-repository";
import { getBucketEnd } from "../in-memory/in-memory-work-analytics-repository";

const BUCKET_UNIT_WHITELIST = {
  day: "day",
  week: "week",
  month: "month",
} as const;

export class TypeORMWorkAnalyticsRepository implements WorkAnalyticsRepository {
  protected readonly repo: Repository<Work>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Work);
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
    const safeUnit = BUCKET_UNIT_WHITELIST[bucketUnit];
    if (!safeUnit) {
      throw new Error(`Invalid bucket unit: ${bucketUnit}`);
    }

    const qb = this.repo
      .createQueryBuilder("work")
      .select("date_trunc(:unit, work.completed_at)", "bucket_start")
      .addSelect("work.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("work.user_id = :userId", { userId })
      .andWhere("work.status = :status", { status: WorkStatus.COMPLETED })
      .andWhere("work.completed_at IS NOT NULL")
      .andWhere("work.completed_at BETWEEN :from AND :to", {
        from: range.from,
        to: range.to,
      })
      .groupBy("date_trunc(:unit, work.completed_at)")
      .addGroupBy("work.type")
      .orderBy("bucket_start", "ASC")
      .setParameter("unit", safeUnit);

    if (type) {
      qb.andWhere("work.type = :type", { type });
    }

    const rows = await qb.getRawMany<{
      bucket_start: Date;
      type: WorkType;
      count: string;
    }>();

    return rows.map((row) => ({
      bucket_start: row.bucket_start,
      bucket_end: getBucketEnd(row.bucket_start, bucketUnit, range.to),
      type: row.type,
      count: Number(row.count),
    }));
  }

  async countBacklogByBucket(
    userId: string,
    range: DateRange,
    bucketUnit: "day" | "week" | "month",
  ): Promise<Array<{ bucket_start: Date; bucket_end: Date; count: number }>> {
    const safeUnit = BUCKET_UNIT_WHITELIST[bucketUnit];
    if (!safeUnit) {
      throw new Error(`Invalid bucket unit: ${bucketUnit}`);
    }

    const rows = await this.repo
      .createQueryBuilder("work")
      .select("date_trunc(:unit, work.created_at)", "bucket_start")
      .addSelect("COUNT(*)", "count")
      .where("work.user_id = :userId", { userId })
      .andWhere("work.status = :status", { status: WorkStatus.TO_CONSUME })
      .andWhere("work.created_at BETWEEN :from AND :to", {
        from: range.from,
        to: range.to,
      })
      .groupBy("date_trunc(:unit, work.created_at)")
      .orderBy("bucket_start", "ASC")
      .setParameter("unit", safeUnit)
      .getRawMany<{ bucket_start: Date; count: string }>();

    return rows.map((row) => ({
      bucket_start: row.bucket_start,
      bucket_end: getBucketEnd(row.bucket_start, bucketUnit, range.to),
      count: Number(row.count),
    }));
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
    const rows = await this.repo
      .createQueryBuilder("work")
      .select("work.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("work.user_id = :userId", { userId })
      .andWhere("work.created_at BETWEEN :from AND :to", {
        from: range.from,
        to: range.to,
      })
      .groupBy("work.status")
      .getRawMany<{ status: WorkStatus; count: string }>();

    const result = { entered: 0, in_progress: 0, completed: 0, abandoned: 0 };

    for (const row of rows) {
      const count = Number(row.count);
      if (row.status === WorkStatus.TO_CONSUME) result.entered = count;
      else if (row.status === WorkStatus.IN_PROGRESS) result.in_progress = count;
      else if (row.status === WorkStatus.COMPLETED) result.completed = count;
      else if (row.status === WorkStatus.ABANDONED) result.abandoned = count;
    }

    return result;
  }

  async countCompletedInRange(
    userId: string,
    range: DateRange,
    type?: WorkType,
  ): Promise<number | null> {
    const qb = this.repo
      .createQueryBuilder("work")
      .where("work.user_id = :userId", { userId })
      .andWhere("work.status = :status", { status: WorkStatus.COMPLETED })
      .andWhere("work.completed_at IS NOT NULL")
      .andWhere("work.completed_at BETWEEN :from AND :to", {
        from: range.from,
        to: range.to,
      });

    if (type) {
      qb.andWhere("work.type = :type", { type });
    }

    return qb.getCount();
  }

  async getAvgWishlistWaitTimeSeconds(
    userId: string,
    range: DateRange,
    type?: WorkType,
  ): Promise<number | null> {
    const qb = this.repo
      .createQueryBuilder("work")
      .select(
        "AVG(EXTRACT(EPOCH FROM (work.started_at - work.created_at)))",
        "avg_seconds",
      )
      .where("work.user_id = :userId", { userId })
      .andWhere("work.started_at IS NOT NULL")
      .andWhere("work.started_at BETWEEN :from AND :to", {
        from: range.from,
        to: range.to,
      });

    if (type) {
      qb.andWhere("work.type = :type", { type });
    }

    const row = await qb.getRawOne<{ avg_seconds: string | null }>();
    return row?.avg_seconds != null ? Number(row.avg_seconds) : null;
  }

  async countByStatus(userId: string, status: WorkStatus): Promise<number> {
    return this.repo.countBy({ user_id: userId, status });
  }
}
