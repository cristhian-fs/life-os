import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import {
  AvgWishlistWaitTimeQuerySchema,
  AvgWishlistWaitTimeResponseSchema,
  CompletedWorksCountQuerySchema,
  CompletedWorksCountResponseSchema,
  WorkBacklogQuerySchema,
  WorkBacklogResponseSchema,
  WorkConsumptionSummaryResponseSchema,
  WorkStatusFunnelQuerySchema,
  WorkStatusFunnelResponseSchema,
} from "@/schemas/work-analytics.schema";

const tags = ["Work Analytics"];

export const backlog = createRoute({
  tags,
  method: "get",
  path: "/works/analytics/backlog",
  summary: "Backlog volume (items to_consume), bucketed over time",
  request: { query: WorkBacklogQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      WorkBacklogResponseSchema,
      "Backlog item counts per bucket",
    ),
  },
});

export type WorkBacklogRoute = typeof backlog;

export const statusFunnel = createRoute({
  tags,
  method: "get",
  path: "/works/analytics/status-funnel",
  summary: "Conversion funnel: entered -> in_progress -> completed/abandoned",
  request: { query: WorkStatusFunnelQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      WorkStatusFunnelResponseSchema,
      "Work item counts by status",
    ),
  },
});

export type WorkStatusFunnelRoute = typeof statusFunnel;

export const completedCount = createRoute({
  tags,
  method: "get",
  path: "/works/analytics/completed-count",
  summary: "Total works completed in a range, optionally by type",
  request: { query: CompletedWorksCountQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      CompletedWorksCountResponseSchema,
      "Completed work count",
    ),
  },
});

export type CompletedWorksCountRoute = typeof completedCount;

export const avgWishlistWaitTime = createRoute({
  tags,
  method: "get",
  path: "/works/analytics/avg-wishlist-wait",
  summary: "Average time between created_at and started_at, in seconds",
  request: { query: AvgWishlistWaitTimeQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      AvgWishlistWaitTimeResponseSchema,
      "Average wishlist wait time",
    ),
  },
});

export type AvgWishlistWaitTimeRoute = typeof avgWishlistWaitTime;

export const summary = createRoute({
  tags,
  method: "get",
  path: "/works/analytics/summary",
  summary:
    "Consumed this month, current backlog, and current in-progress count",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      WorkConsumptionSummaryResponseSchema,
      "Current consumption summary",
    ),
  },
});

export type WorkConsumptionSummaryRoute = typeof summary;
