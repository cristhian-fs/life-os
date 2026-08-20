import { OpenAPIHono } from "@hono/zod-openapi";
import type { ErrorHandler, NotFoundHandler, Schema } from "hono";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { rateLimiter } from "hono-rate-limiter";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { serveEmojiFavicon } from "stoker/middlewares";
import env from "@life-os/env";
import authCors from "@/http/middlewares/auth-cors";
import { pinoLogger } from "@/http/middlewares/pino-logger";
import withSession from "@/http/middlewares/with-session";
import { auth } from "./auth";
import { ProblemCode, problem } from "./problem-details";
import type { AppBindings, AppOpenAPI } from "./types";

const notFound: NotFoundHandler = (c) => {
  return problem(c, HttpStatusCodes.NOT_FOUND, {
    detail: `${c.req.path} not found`,
    code: ProblemCode.NOT_FOUND,
  });
};

const onError: ErrorHandler<AppBindings> = (err, c) => {
  if (err instanceof HTTPException) {
    const code =
      err.status === 401
        ? ProblemCode.UNAUTHORIZED
        : err.status === 403
          ? ProblemCode.FORBIDDEN
          : err.status === 404
            ? ProblemCode.NOT_FOUND
            : err.status === 429
              ? ProblemCode.RATE_LIMITED
              : err.status === 502
                ? ProblemCode.AI_RUN_FAILED
                : undefined;

    return problem(c, err.status, { detail: err.message, code });
  }

  const detail = env.NODE_ENV !== "production" ? err.message : undefined;
  return problem(c, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
    detail,
    code: ProblemCode.INTERNAL_ERROR,
  });
};

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: (result, c) => {
      if (!result.success) {
        return problem(c, HttpStatusCodes.UNPROCESSABLE_ENTITY, {
          detail: "Request validation failed",
          code: ProblemCode.VALIDATION_FAILED,
          extensions: { errors: result.error.issues },
        });
      }
    },
  });
}

export default function createApp() {
  const app = createRouter();
  app
    .use(requestId())
    .use(serveEmojiFavicon("📝"))
    .use(pinoLogger())
    .use("*", authCors)
    .use("*", withSession)
    .use(
      rateLimiter({
        windowMs: 5 * 60 * 1000, //5 minutes
        limit: 100, // Limit each client to 100 requests per window
        keyGenerator: (c) =>
          c.req.header("x-forwarded-for") ??
          c.req.header("x-real-ip") ??
          c.get("requestId") ??
          "unknown",
      }),
    )
    .on(["POST", "GET"], "/api/auth/*", (c) => {
      return auth.handler(c.req.raw);
    });

  app.notFound(notFound);
  app.onError(onError);
  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
