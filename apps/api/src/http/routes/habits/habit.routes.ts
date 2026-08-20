import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { NotFoundSchema } from "@/schemas/common.schema";
import { HabitsResponseSchema } from "@/schemas/habits.schema";

const tags = ["Habits"];

export const list = createRoute({
  tags,
  method: "get",
  path: "/habits",
  summary: "List all user habits",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(HabitsResponseSchema),
      "Tag list",
    ),
  },
});

export type ListHabitsRoute = typeof list;
