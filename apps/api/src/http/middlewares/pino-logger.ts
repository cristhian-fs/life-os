import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import env from "@life-os/env";

export function pinoLogger() {
  return logger({
    pino: pino(
      {
        level: env.LOG_LEVEL || "info",
      },
      env.NODE_ENV === "production" ? undefined : pretty(),
    ),
    http: {
      // default hono-pino bindings dump full req/res headers on every
      // request — noisy. Keep only method/path/status/responseTime.
      onReqBindings: (c) => ({
        req: { method: c.req.method, path: c.req.path },
      }),
      onResBindings: (c) => ({
        res: { status: c.res.status },
      }),
    },
  });
}
