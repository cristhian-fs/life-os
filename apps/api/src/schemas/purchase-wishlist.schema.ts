import { z } from "@hono/zod-openapi";

// e.g. "USD", "BRL" — short by design, not a free-text field.
const currencySchema = z.string().max(10).nullable().optional();

// No `user_id` field — it's always set from the session, never trusted from the client.
export const CreatePurchaseWishlistSchema = z.object({
  work_id: z.string().uuid().nullable().optional(),
  title: z.string().nullable().optional(),
  estimated_price_in_cents: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),
  currency: currencySchema,
  store_or_url: z.string().min(1),
});

export type CreatePurchaseWishlistBody = z.infer<
  typeof CreatePurchaseWishlistSchema
>;

export const UpdatePurchaseWishlistSchema = z.object({
  work_id: z.string().uuid().nullable().optional(),
  title: z.string().nullable().optional(),
  estimated_price_in_cents: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),
  currency: currencySchema,
  store_or_url: z.string().min(1).optional(),
  purchased_at: z.string().datetime().nullable().optional(),
});

export type UpdatePurchaseWishlistBody = z.infer<
  typeof UpdatePurchaseWishlistSchema
>;

// Light summary, not the full WorkResponse — purchase-wishlist doesn't join detail tables.
const PurchaseWishlistWorkSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  creator: z.string(),
  status: z.string(),
  image_url: z.string().nullable(),
});

export const PurchaseWishlistResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  work_id: z.string().nullable(),
  work: PurchaseWishlistWorkSchema.nullable(),
  title: z.string().nullable(),
  estimated_price_in_cents: z.number().nullable(),
  currency: z.string().nullable(),
  store_or_url: z.string(),
  purchased_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export type PurchaseWishlistResponse = z.infer<
  typeof PurchaseWishlistResponseSchema
>;

export const DeletePurchaseWishlistResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
