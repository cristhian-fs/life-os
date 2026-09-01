import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/schemas/common.schema";
import {
  CreatePurchaseWishlistSchema,
  DeletePurchaseWishlistResponseSchema,
  PendingWishlistSummaryResponseSchema,
  PurchaseWishlistResponseSchema,
  UpdatePurchaseWishlistSchema,
} from "@/schemas/purchase-wishlist.schema";

const tags = ["Purchase Wishlist"];

export const create = createRoute({
  tags,
  method: "post",
  path: "/purchase-wishlist",
  summary: "Create a user purchase wishlist item",
  request: {
    body: jsonContentRequired(
      CreatePurchaseWishlistSchema,
      "The wishlist item to create",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PurchaseWishlistResponseSchema,
      "Wishlist item created",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Referenced work not found",
    ),
  },
});

export type CreatePurchaseWishlistRoute = typeof create;

export const list = createRoute({
  tags,
  method: "get",
  path: "/purchase-wishlist",
  summary: "List all user purchase wishlist items",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(PurchaseWishlistResponseSchema),
      "Wishlist item list",
    ),
  },
});

export type ListPurchaseWishlistRoute = typeof list;

export const summary = createRoute({
  tags,
  method: "get",
  path: "/purchase-wishlist/summary",
  summary: "Pending item count and total estimated price",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PendingWishlistSummaryResponseSchema,
      "Summary of pending (not yet purchased) wishlist items",
    ),
  },
});

export type PendingWishlistSummaryRoute = typeof summary;

export const get = createRoute({
  tags,
  method: "get",
  path: "/purchase-wishlist/{id}",
  summary: "Get a user purchase wishlist item by id",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PurchaseWishlistResponseSchema,
      "The wishlist item",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Wishlist item not found",
    ),
  },
});

export type GetPurchaseWishlistRoute = typeof get;

export const update = createRoute({
  tags,
  method: "patch",
  path: "/purchase-wishlist/{id}",
  summary: "Update a user purchase wishlist item",
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      UpdatePurchaseWishlistSchema,
      "The wishlist fields to update",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PurchaseWishlistResponseSchema,
      "The updated wishlist item",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Wishlist item or referenced work not found",
    ),
  },
});

export type UpdatePurchaseWishlistRoute = typeof update;

export const deletePurchaseWishlist = createRoute({
  tags,
  method: "delete",
  path: "/purchase-wishlist/{id}",
  summary: "Delete a user purchase wishlist item",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      DeletePurchaseWishlistResponseSchema,
      "Wishlist item deleted",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      DeletePurchaseWishlistResponseSchema,
      "Wishlist item not found",
    ),
  },
});

export type DeletePurchaseWishlistRoute = typeof deletePurchaseWishlist;
