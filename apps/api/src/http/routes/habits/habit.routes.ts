import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/schemas/common.schema";
import {
  BestStreaksResponseSchema,
  CreateHabitSchema,
  DeleteHabitResponseSchema,
  HabitsResponseSchema,
  UpdateHabitSchema,
} from "@/schemas/habits.schema";

const tags = ["Habits"];

export const create = createRoute({
  tags,
  method: "post",
  path: "/habits",
  summary: "Create a user habit",
  request: {
    body: jsonContentRequired(CreateHabitSchema, "The habit fields to create"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(HabitsResponseSchema, "Habit created"),
  },
});

export type CreateHabitRoute = typeof create;

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

export const update = createRoute({
  tags,
  method: "patch",
  path: "/habits/{id}",
  summary: "Update a user habit",
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(UpdateHabitSchema, "The habit fields to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      HabitsResponseSchema,
      "The updated habit",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Habit not found"),
  },
});

export type UpdateHabitRoute = typeof update;

export const deleteHabit = createRoute({
  tags,
  method: "delete",
  path: "habits/{id}",
  summary: "Delete a user habit",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      DeleteHabitResponseSchema,
      "Habit deleted",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      DeleteHabitResponseSchema,
      "Habit not found",
    ),
  },
});

export type DeleteHabitRoute = typeof deleteHabit;

export const archiveHabit = createRoute({
  tags,
  method: "patch",
  path: "/habits/{id}/archive",
  summary: "Archive a user habit",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(HabitsResponseSchema, "Habit archived"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Habit not found"),
  },
});

export type ArchiveHabitRoute = typeof archiveHabit;

export const bestStreaks = createRoute({
  tags,
  method: "get",
  path: "/habits/{id}/best-streaks",
  summary: "Get a habit's best streaks",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      BestStreaksResponseSchema,
      "The habit's streaks, longest first",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Habit not found"),
  },
});

export type BestStreaksRoute = typeof bestStreaks;
