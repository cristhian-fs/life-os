import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Entry } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'

export const createEntryInputSchema = z.object({
  habit_id: z.string(),
  date: z.string(),
  value_boolean: z.boolean().nullable(),
  value_numeric: z.number().nullable(),
  note: z.string().nullable(),
})

export type CreateEntryInput = z.infer<typeof createEntryInputSchema>

export const createEntry = ({
  data,
}: {
  data: CreateEntryInput
}): Promise<Entry> => {
  return api.post('/entries', data)
}

type UseCreateEntryOptions = {
  mutationConfig?: MutationConfig<typeof createEntry>
}

export const useCreateEntry = ({
  mutationConfig,
}: UseCreateEntryOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['entries', data.habit_id] })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: createEntry,
  })
}
