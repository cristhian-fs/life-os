import { useCreateEntry } from '#/features/entries/api/create-entry'
import { getEntriesQueryOptions } from '#/features/entries/api/get-entries'
import { useUpdateEntry } from '#/features/entries/api/update-entry'
import { getHabitDetailQueryOptions } from '#/features/habits/api/get-habit'
import { useQueryClient } from '@tanstack/react-query'

type LogValue = {
  value_boolean?: boolean | null
  value_numeric?: number | null
}

/**
 * Logs a value for one specific day, upserting: looks up whether an entry
 * already exists for that date and patches it instead of creating a
 * duplicate. Needed because the heatmap lets you click any day — including
 * today — and a blind create there would double up with whatever the
 * habit's own check-in control already logged for today.
 */
export function useLogHabitDay(habitId: string) {
  const queryClient = useQueryClient()

  const invalidateReports = () => {
    queryClient.invalidateQueries({
      queryKey: getHabitDetailQueryOptions(habitId).queryKey,
    })
  }

  const createEntry = useCreateEntry({
    mutationConfig: { onSuccess: invalidateReports },
  })
  const updateEntry = useUpdateEntry({
    mutationConfig: { onSuccess: invalidateReports },
  })

  const logDay = async (date: string, value: LogValue) => {
    const existing = await queryClient.fetchQuery(
      getEntriesQueryOptions({ habitId, startDate: date, endDate: date }),
    )
    // No unique constraint on (habit, date) server-side — last one wins,
    // same rule useCheckInHabit and the report builders already use.
    const entry = existing.at(-1)
    if (entry) {
      return updateEntry.mutateAsync({ id: entry.id, data: value })
    }
    return createEntry.mutateAsync({
      data: {
        habit_id: habitId,
        date,
        value_boolean: null,
        value_numeric: null,
        note: null,
        ...value,
      },
    })
  }

  return { logDay, isPending: createEntry.isPending || updateEntry.isPending }
}
