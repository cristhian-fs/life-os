import { api } from '#/lib/api-client'
import { habitSchema } from '#/features/habits/lib/habit-schema'
import type { MutationConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type z from 'zod'
import { getHabitsQueryOptions } from './get-habits'

export const createHabitInputSchema = habitSchema

export type CreateHabitInput = z.infer<typeof createHabitInputSchema>

export const createHabit = ({
  data,
}: {
  data: CreateHabitInput
}): Promise<Habit> => {
  return api.post(`/habits`, data)
}

type UseCreateHabitOptions = {
  mutationConfig?: MutationConfig<typeof createHabit>
}

export const useCreateHabit = ({
  mutationConfig,
}: UseCreateHabitOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getHabitsQueryOptions().queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: createHabit,
  })
}
