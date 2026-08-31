import { z } from "@hono/zod-openapi";
import { WorkType } from "@/db/entities/work.entity";

const RangeQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export const WorkBacklogQuerySchema = RangeQuerySchema.extend({
  bucketUnit: z.enum(["day", "week", "month"]),
});

export const WorkStatusFunnelQuerySchema = RangeQuerySchema;

export const CompletedWorksCountQuerySchema = RangeQuerySchema.extend({
  type: z.enum(WorkType).optional(),
});

export const AvgWishlistWaitTimeQuerySchema = CompletedWorksCountQuerySchema;

export const WorkBacklogBucketSchema = z.object({
  bucket_start: z.string().datetime(),
  bucket_end: z.string().datetime(),
  count: z.number(),
});

export const WorkBacklogResponseSchema = z.array(WorkBacklogBucketSchema);

export const WorkStatusFunnelResponseSchema = z.object({
  entered: z.number(),
  in_progress: z.number(),
  completed: z.number(),
  abandoned: z.number(),
});

export const CompletedWorksCountResponseSchema = z.object({
  count: z.number().nullable(),
});

export const AvgWishlistWaitTimeResponseSchema = z.object({
  avg_seconds: z.number().nullable(),
});

export const WorkConsumptionSummaryResponseSchema = z.object({
  consumed_this_month: z.number().nullable(),
  backlog_now: z.number(),
  in_progress_now: z.number(),
});
