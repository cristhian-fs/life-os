import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Entry } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'

export const updateEntryInputSchema = z.object({
  date: z.string().optional(),
  value_boolean: z.boolean().nullable().optional(),
  value_numeric: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
})

export type UpdateEntryInput = z.infer<typeof updateEntryInputSchema>

export const updateEntry = ({
  id,
  data,
}: {
  id: string
  data: UpdateEntryInput
}): Promise<Entry> => {
  return api.patch(`/entries/${id}`, data)
}

type UseUpdateEntryOptions = {
  mutationConfig?: MutationConfig<typeof updateEntry>
}

export const useUpdateEntry = ({
  mutationConfig,
}: UseUpdateEntryOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['entries', data.habit_id] })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: updateEntry,
  })
}
