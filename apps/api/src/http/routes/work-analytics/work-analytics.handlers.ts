import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { ensureInitialized } from "@/lib/utils";
import { TypeORMWorkAnalyticsRepository } from "@/repositories/typeorm/typeorm-work-analytics-repository";
import { AvgWishlistWaitTimeUseCase } from "@/use-cases/avg-wishlist-wait-time-use-case";
import { CompletedWorksCountUseCase } from "@/use-cases/completed-works-count-use-case";
import { WorkBacklogUseCase } from "@/use-cases/work-backlog-use-case";
import { WorkStatusFunnelUseCase } from "@/use-cases/work-status-funnel-use-case";
import type {
  AvgWishlistWaitTimeRoute,
  CompletedWorksCountRoute,
  WorkBacklogRoute,
  WorkStatusFunnelRoute,
} from "./work-analytics.routes";

function requireUser(c: { get: (key: "user") => unknown }) {
  const user = c.get("user") as { id: string } | null;

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return user;
}

export const backlog: AppRouteHandler<WorkBacklogRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);
  const { from, to, bucketUnit } = c.req.valid("query");

  const repository = new TypeORMWorkAnalyticsRepository(dataSource);
  const useCase = new WorkBacklogUseCase(repository);

  const { data } = await useCase.execute({
    userId: user.id,
    range: { from: new Date(from), to: new Date(to) },
    bucketUnit,
  });

  return c.json(
    data.map((bucket) => ({
      bucket_start: bucket.bucket_start.toISOString(),
      bucket_end: bucket.bucket_end.toISOString(),
      count: bucket.count,
    })),
    HttpStatusCodes.OK,
  );
};

export const statusFunnel: AppRouteHandler<WorkStatusFunnelRoute> = async (
  c,
) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);
  const { from, to } = c.req.valid("query");

  const repository = new TypeORMWorkAnalyticsRepository(dataSource);
  const useCase = new WorkStatusFunnelUseCase(repository);

  const { data } = await useCase.execute({
    userId: user.id,
    range: { from: new Date(from), to: new Date(to) },
  });

  return c.json(data, HttpStatusCodes.OK);
};

export const completedCount: AppRouteHandler<CompletedWorksCountRoute> =
  async (c) => {
    const dataSource = await ensureInitialized();
    const user = requireUser(c);
    const { from, to, type } = c.req.valid("query");

    const repository = new TypeORMWorkAnalyticsRepository(dataSource);
    const useCase = new CompletedWorksCountUseCase(repository);

    const { data } = await useCase.execute({
      userId: user.id,
      range: { from: new Date(from), to: new Date(to) },
      type,
    });

    return c.json({ count: data }, HttpStatusCodes.OK);
  };

export const avgWishlistWaitTime: AppRouteHandler<
  AvgWishlistWaitTimeRoute
> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);
  const { from, to, type } = c.req.valid("query");

  const repository = new TypeORMWorkAnalyticsRepository(dataSource);
  const useCase = new AvgWishlistWaitTimeUseCase(repository);

  const { data } = await useCase.execute({
    userId: user.id,
    range: { from: new Date(from), to: new Date(to) },
    type,
  });

  return c.json({ avg_seconds: data }, HttpStatusCodes.OK);
};
