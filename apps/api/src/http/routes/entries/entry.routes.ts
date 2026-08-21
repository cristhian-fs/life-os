import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/schemas/common.schema";
import {
  CreateEntrySchema,
  DeleteEntryResponseSchema,
  EntriesResponseSchema,
  ListEntriesQuerySchema,
  UpdateEntrySchema,
} from "@/schemas/entries.schema";

const tags = ["Entries"];

export const create = createRoute({
  tags,
  method: "post",
  path: "/entries",
  summary: "Create a user entry",
  request: {
    body: jsonContentRequired(CreateEntrySchema, "The entry fields to create"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(EntriesResponseSchema, "Entry created"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Habit not found"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      NotFoundSchema,
      "Habit belongs to another user",
    ),
  },
});

export type CreateEntryRoute = typeof create;

export const list = createRoute({
  tags,
  method: "get",
  path: "/entries",
  summary: "List entries for a habit within a date range",
  request: {
    query: ListEntriesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(EntriesResponseSchema),
      "Entry list",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Habit not found"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      NotFoundSchema,
      "Habit belongs to another user",
    ),
  },
});

export type ListEntriesRoute = typeof list;

export const update = createRoute({
  tags,
  method: "patch",
  path: "/entries/{id}",
  summary: "Update a user entry",
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(UpdateEntrySchema, "The entry fields to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      EntriesResponseSchema,
      "The updated entry",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Entry not found"),
  },
});

export type UpdateEntryRoute = typeof update;

export const deleteEntry = createRoute({
  tags,
  method: "delete",
  path: "/entries/{id}",
  summary: "Delete a user entry",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      DeleteEntryResponseSchema,
      "Entry deleted",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      DeleteEntryResponseSchema,
      "Entry not found",
    ),
  },
});

export type DeleteEntryRoute = typeof deleteEntry;
