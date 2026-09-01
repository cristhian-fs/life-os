import type { WorkAnalyticsBacklogRequest } from '#/types/api'
import {
  endOfMonth,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns'

export const DATE_RANGE_PRESETS = [
  'MTD',
  'LM',
  '30D',
  '90D',
  'YTD',
  '365D',
] as const
export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]

export const dateRangePresetLabel: Record<DateRangePreset, string> = {
  MTD: 'Month to date',
  LM: 'Last month',
  '30D': 'Last 30 days',
  '90D': 'Last 90 days',
  YTD: 'Year to date',
  '365D': 'Last 365 days',
}

/** Coarser bucket for a wider range so the backlog chart doesn't render hundreds of bars. */
const bucketUnitByPreset: Record<
  DateRangePreset,
  WorkAnalyticsBacklogRequest['bucketUnit']
> = {
  MTD: 'day',
  LM: 'day',
  '30D': 'day',
  '90D': 'week',
  YTD: 'week',
  '365D': 'month',
}

export function bucketUnitForPreset(
  preset: DateRangePreset,
): WorkAnalyticsBacklogRequest['bucketUnit'] {
  return bucketUnitByPreset[preset]
}

export function dateRangeForPreset(preset: DateRangePreset): {
  from: Date
  to: Date
} {
  const now = new Date()

  switch (preset) {
    case 'MTD':
      return { from: startOfMonth(now), to: now }
    case 'LM': {
      const lastMonth = subMonths(now, 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    }
    case '30D':
      return { from: subDays(now, 30), to: now }
    case '90D':
      return { from: subDays(now, 90), to: now }
    case 'YTD':
      return { from: startOfYear(now), to: now }
    case '365D':
      return { from: subDays(now, 365), to: now }
  }
}
