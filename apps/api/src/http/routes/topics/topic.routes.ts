import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/schemas/common.schema";
import {
  CreateTopicSchema,
  DeleteTopicResponseSchema,
  TopicsResponseSchema,
  TopicTreeResponseSchema,
  UpdateTopicSchema,
} from "@/schemas/topics.schema";

const tags = ["Topics"];

export const create = createRoute({
  tags,
  method: "post",
  path: "/topics",
  summary: "Create a user topic",
  request: {
    body: jsonContentRequired(CreateTopicSchema, "The topic fields to create"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(TopicsResponseSchema, "Topic created"),
  },
});

export type CreateTopicRoute = typeof create;

export const list = createRoute({
  tags,
  method: "get",
  path: "/topics",
  summary: "List all user topics",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(TopicsResponseSchema),
      "Topic list",
    ),
  },
});

export type ListTopicsRoute = typeof list;

export const get = createRoute({
  tags,
  method: "get",
  path: "/topics/{id}",
  summary: "Get a user topic by id",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(TopicsResponseSchema, "The topic"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Topic not found"),
  },
});

export type GetTopicRoute = typeof get;

export const update = createRoute({
  tags,
  method: "patch",
  path: "/topics/{id}",
  summary: "Update a user topic",
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(UpdateTopicSchema, "The topic fields to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      TopicsResponseSchema,
      "The updated topic",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Topic not found"),
  },
});

export type UpdateTopicRoute = typeof update;

export const deleteTopic = createRoute({
  tags,
  method: "delete",
  path: "/topics/{id}",
  summary: "Delete a user topic",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      DeleteTopicResponseSchema,
      "Topic deleted",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      DeleteTopicResponseSchema,
      "Topic not found",
    ),
  },
});

export type DeleteTopicRoute = typeof deleteTopic;

export const tree = createRoute({
  tags,
  method: "get",
  path: "/topics/{id}/tree",
  summary:
    "Get a topic plus every descendant, nested under parent_topic_id as children",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      TopicTreeResponseSchema,
      "The root topic, with descendants nested as children",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Topic not found"),
  },
});

export type TopicTreeRoute = typeof tree;
