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

// ====================
// WORKS
// ====================

export enum WorkType {
  BOOK = 'book',
  MOVIE = 'movie',
  ARTICLE = 'article',
  COURSE = 'course',
  VIDEO = 'video',
}

export enum WorkStatus {
  TO_CONSUME = 'to_consume',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

interface BaseWork {
  id: string
  user_id: string
  title: string
  creator: string
  status: WorkStatus
  rating: number | null
  started_at: string | null
  completed_at: string | null
  summary: string | null
  external_url: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export type BookWork = BaseWork & {
  type: WorkType.BOOK
  detail: {
    isbn: string | null
    pages: number | null
    publisher: string | null
  } | null
}

export type MovieWork = BaseWork & {
  type: WorkType.MOVIE
  detail: {
    runtime_minutes: number | null
    director: string | null
  } | null
}

export type ArticleWork = BaseWork & {
  type: WorkType.ARTICLE
  detail: {
    source_name: string
    reading_time_minutes: number | null
    published_at: string | null
  } | null
}

export type CourseWork = BaseWork & {
  type: WorkType.COURSE
  detail: {
    platform: string | null
    instructor: string | null
    duration_hours: number | null
  } | null
}

export type VideoWork = BaseWork & {
  type: WorkType.VIDEO
  detail: {
    platform: string | null
    duration_minutes: number | null
  } | null
}

export type Work = BookWork | MovieWork | ArticleWork | CourseWork | VideoWork

export type DeleteWorkResponse = {
  success: boolean
  message: string
}

// ====================
// PURCHASE WISHLIST
// ====================

// Light summary, not the full Work — purchase-wishlist doesn't join detail tables.
export type PurchaseWishlistWork = {
  id: string
  type: WorkType
  title: string
  creator: string
  status: WorkStatus
  image_url: string | null
}

export type PurchaseWishlist = {
  id: string
  user_id: string
  work_id: string | null
  work: PurchaseWishlistWork | null
  title: string | null
  estimated_price_in_cents: number | null
  currency: string | null
  store_or_url: string
  purchased_at: string | null
  created_at: string
}
export type DeletePurchaseWishlistResponse = {
  success: boolean
  message: string
}

// WORKS ANALYTICS
// ====================

export type WorkAnalyticsBacklogRequest = {
  from: Date
  to: Date
  bucketUnit: 'day' | 'week' | 'month'
}

export type WorkAnalyticsBacklogResponse = Array<{
  bucket_start: string
  bucket_end: string
  count: number
}>

export type WorkConversionFunnelRequest = {
  from: Date
  to: Date
}
export type WorkConversionFunnelResponse = {
  entered: number
  in_progress: number
  completed: number
  abandoned: number
}

export type WorkCompletedCountRequest = {
  from: Date
  to: Date
  type?: WorkType
}
export type WorkCompletedCountResponse = {
  count: number | null
}

export type WorkAvgWishlistWaitRequest = {
  from: Date
  to: Date
  type?: WorkType
}
export type WorkAvgWishlistWaitResponse = {
  avg_seconds: number | null
}
