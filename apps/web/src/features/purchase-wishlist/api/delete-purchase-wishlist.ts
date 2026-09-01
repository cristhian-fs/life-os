import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { DeletePurchaseWishlistResponse } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseWishlistQueryKey } from './get-purchase-wishlists'

export const deletePurchaseWishlist = ({
  id,
}: {
  id: string
}): Promise<DeletePurchaseWishlistResponse> => {
  return api.delete(`/purchase-wishlist/${id}`)
}

type UseDeletePurchaseWishlistOptions = {
  mutationConfig?: MutationConfig<typeof deletePurchaseWishlist>
}

export const useDeletePurchaseWishlist = ({
  mutationConfig,
}: UseDeletePurchaseWishlistOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: purchaseWishlistQueryKey })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: deletePurchaseWishlist,
  })
}
