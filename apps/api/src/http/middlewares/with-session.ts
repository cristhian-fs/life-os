import type { MiddlewareHandler } from "hono";

import { auth } from "@/lib/auth";
import type { AppBindings as Context } from "@/lib/types";

const withSession: MiddlewareHandler<Context> = async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
  } catch (error) {
    c.var.logger.error({ error }, "Failed to get session");
    c.set("user", null);
    c.set("session", null);
  }
  return next();
};

export default withSession;
