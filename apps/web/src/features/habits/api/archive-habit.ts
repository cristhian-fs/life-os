import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getHabitQueryOptions } from './get-habit'

export const archiveHabit = ({ id }: { id: string }): Promise<Habit> => {
  return api.patch(`/habits/${id}/archive`)
}

type UseArchiveHabitOptions = {
  mutationConfig?: MutationConfig<typeof archiveHabit>
}

export const useArchiveHabit = ({
  mutationConfig,
}: UseArchiveHabitOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getHabitQueryOptions(data.id).queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: archiveHabit,
  })
}
