import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { type AppBindings as Context } from "@/lib/types";

export const loggedIn = createMiddleware<Context>(async (c, next) => {
  const user = await c.get("user");
  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  await next();
});
