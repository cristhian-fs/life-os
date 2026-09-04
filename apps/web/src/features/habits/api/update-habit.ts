import { habitFieldsSchema } from '#/features/habits/lib/habit-schema'
import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type z from 'zod'
import { getHabitDetailQueryOptions } from './get-habit'

// The API can only patch these fields — type/unit are fixed at creation.
export const updateHabitInputSchema = habitFieldsSchema.pick({
  name: true,
  description: true,
  icon: true,
  goal_value: true,
  goal_period: true,
  active_weekdays: true,
})

export type UpdateHabitInput = z.infer<typeof updateHabitInputSchema>

export const updateHabit = ({
  id,
  data,
}: {
  id: string
  data: UpdateHabitInput
}): Promise<Habit> => {
  return api.patch(`/habits/${id}`, data)
}

type UseUpdateHabitOptions = {
  mutationConfig?: MutationConfig<typeof updateHabit>
}

export const useUpdateHabit = ({
  mutationConfig,
}: UseUpdateHabitOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getHabitDetailQueryOptions(data.id).queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: updateHabit,
  })
}
