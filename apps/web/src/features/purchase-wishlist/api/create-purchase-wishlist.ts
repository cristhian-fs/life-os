import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { PurchaseWishlist } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'
import { purchaseWishlistQueryKey } from './get-purchase-wishlists'

// Mirrors the API's CreatePurchaseWishlistSchema (apps/api/src/schemas/purchase-wishlist.schema.ts).
export const createPurchaseWishlistInputSchema = z.object({
  work_id: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  estimated_price_in_cents: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().max(10).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  store_or_url: z.string().min(1),
})

export type CreatePurchaseWishlistInput = z.infer<
  typeof createPurchaseWishlistInputSchema
>

export const createPurchaseWishlist = ({
  data,
}: {
  data: CreatePurchaseWishlistInput
}): Promise<PurchaseWishlist> => {
  return api.post('/purchase-wishlist', data)
}

type UseCreatePurchaseWishlistOptions = {
  mutationConfig?: MutationConfig<typeof createPurchaseWishlist>
}

export const useCreatePurchaseWishlist = ({
  mutationConfig,
}: UseCreatePurchaseWishlistOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: purchaseWishlistQueryKey })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: createPurchaseWishlist,
  })
}
