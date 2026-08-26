import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { DeleteEntryResponse } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const deleteEntry = ({
  id,
}: {
  id: string
}): Promise<DeleteEntryResponse> => {
  return api.delete(`/entries/${id}`)
}

type UseDeleteEntryOptions = {
  // the delete response has no habit_id, so the caller passes it through for cache invalidation
  habitId: string
  mutationConfig?: MutationConfig<typeof deleteEntry>
}

export const useDeleteEntry = ({
  habitId,
  mutationConfig,
}: UseDeleteEntryOptions) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['entries', habitId] })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: deleteEntry,
  })
}
