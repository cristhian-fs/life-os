import { z } from "@hono/zod-openapi";

export const NotFoundSchema = z.object({ message: z.string() });
