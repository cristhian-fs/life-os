export enum HabitType {
  BOOLEAN = 'boolean',
  NUMERIC = 'numeric',
}

export enum HabitGoalPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum HabitStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export type HabitPeriodRequest =
  'week' | 'month' | '3months' | '6months' | 'year' | 'all'

export type Habit = {
  id: string
  user_id: string
  name: string
  description: string | null
  type: HabitType
  unit: string | null
  goal_value: number | null
  goal_period: HabitGoalPeriod
  status: HabitStatus
  created_at: string
  updated_at: string
  archived_at: string | null
}

export type DeleteHabitResponse = {
  success: boolean
  message: string
}

export type HabitBestStreaksResponse = Array<{
  from: string
  to: string
  streak_num: number
}>

export type HabitScoreHistoryRequest = {
  id: string
  period: HabitPeriodRequest
}

export type HabitScoreHistoryResponse = Array<{
  date: string
  percentage: number
}>

export type HabitHistoryBarGraphRequest = {
  id: string
  period: HabitPeriodRequest
}

export type HabitHistoryBarGraphResponse = Array<{
  date: string
  count: number
}>

export type HabitCalendarMapRequest = {
  id: string
}

export type HabitCalendarMapResponse = Array<{
  date: string
  percentage: number
}>

export type Entry = {
  id: string
  user_id: string
  habit_id: string
  date: string
  value_boolean: boolean | null
  value_numeric: number | null
  note: string | null
  created_at: string
  updated_at: string
}

export type DeleteEntryResponse = {
  success: boolean
  message: string
}
