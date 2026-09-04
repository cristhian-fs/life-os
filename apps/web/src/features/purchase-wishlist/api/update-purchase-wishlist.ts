import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { PurchaseWishlist } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'
import { purchaseWishlistQueryKey } from './get-purchase-wishlists'

// Mirrors the API's UpdatePurchaseWishlistSchema — every field optional.
export const updatePurchaseWishlistInputSchema = z.object({
  work_id: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  estimated_price_in_cents: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().max(10).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  store_or_url: z.string().min(1).optional(),
  purchased_at: z.string().nullable().optional(),
})

export type UpdatePurchaseWishlistInput = z.infer<
  typeof updatePurchaseWishlistInputSchema
>

export const updatePurchaseWishlist = ({
  id,
  data,
}: {
  id: string
  data: UpdatePurchaseWishlistInput
}): Promise<PurchaseWishlist> => {
  return api.patch(`/purchase-wishlist/${id}`, data)
}

type UseUpdatePurchaseWishlistOptions = {
  mutationConfig?: MutationConfig<typeof updatePurchaseWishlist>
}

export const useUpdatePurchaseWishlist = ({
  mutationConfig,
}: UseUpdatePurchaseWishlistOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: purchaseWishlistQueryKey })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: updatePurchaseWishlist,
  })
}
