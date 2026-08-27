import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/schemas/common.schema";
import {
  CreateWorkSchema,
  DeleteWorkResponseSchema,
  UpdateWorkSchema,
  WorkResponseSchema,
} from "@/schemas/work.schema";

const tags = ["Works"];

export const create = createRoute({
  tags,
  method: "post",
  path: "/works",
  summary: "Create a user work item",
  request: {
    body: jsonContentRequired(CreateWorkSchema, "The work item to create"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(WorkResponseSchema, "Work created"),
  },
});

export type CreateWorkRoute = typeof create;

export const list = createRoute({
  tags,
  method: "get",
  path: "/works",
  summary: "List all user work items",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(WorkResponseSchema),
      "Work item list",
    ),
  },
});

export type ListWorksRoute = typeof list;

export const update = createRoute({
  tags,
  method: "patch",
  path: "/works/{id}",
  summary: "Update a user work item (its type cannot be changed)",
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(UpdateWorkSchema, "The work fields to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      WorkResponseSchema,
      "The updated work item",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Work item not found",
    ),
  },
});

export type UpdateWorkRoute = typeof update;

export const deleteWork = createRoute({
  tags,
  method: "delete",
  path: "/works/{id}",
  summary: "Delete a user work item",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      DeleteWorkResponseSchema,
      "Work item deleted",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      DeleteWorkResponseSchema,
      "Work item not found",
    ),
  },
});

export type DeleteWorkRoute = typeof deleteWork;
