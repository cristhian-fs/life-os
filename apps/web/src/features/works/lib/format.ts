import i18n from '#/i18n'
import { WorkStatus, WorkType } from '#/types/api'
import type { Work } from '#/types/api'
import type { Icon } from '@phosphor-icons/react'
import {
  BooksIcon,
  FilmReelIcon,
  GraduationCapIcon,
  NewspaperIcon,
  VideoCameraIcon,
} from '@phosphor-icons/react'

export const workTypeIcon: Record<WorkType, Icon> = {
  [WorkType.BOOK]: BooksIcon,
  [WorkType.MOVIE]: FilmReelIcon,
  [WorkType.ARTICLE]: NewspaperIcon,
  [WorkType.COURSE]: GraduationCapIcon,
  [WorkType.VIDEO]: VideoCameraIcon,
}

// Every workType* lookup below is a switch, not a Record<WorkType, string> —
// a Record's value type widens to `string` on access, which i18next's typed
// t() rejects (same fix as goalPeriodLabel in features/habits/lib/format.ts).

/** Plural heading label, e.g. the vault type page's "Books" / "Filmes". */
export function workTypeLabel(type: WorkType): string {
  switch (type) {
    case WorkType.BOOK:
      return i18n.t('books.title')
    case WorkType.MOVIE:
      return i18n.t('movies.title')
    case WorkType.ARTICLE:
      return i18n.t('articles.title')
    case WorkType.COURSE:
      return i18n.t('courses.title')
    case WorkType.VIDEO:
      return i18n.t('videos.title')
  }
}

/** Singular label, for toasts ("Book added") and buttons ("New book"). */
export function workTypeSingular(type: WorkType): string {
  switch (type) {
    case WorkType.BOOK:
      return i18n.t('books.titleSingular')
    case WorkType.MOVIE:
      return i18n.t('movies.titleSingular')
    case WorkType.ARTICLE:
      return i18n.t('articles.titleSingular')
    case WorkType.COURSE:
      return i18n.t('courses.titleSingular')
    case WorkType.VIDEO:
      return i18n.t('videos.titleSingular')
  }
}

/** Inviting subhead under the heading on each vault type page. */
export function workTypeSubtitle(type: WorkType): string {
  switch (type) {
    case WorkType.BOOK:
      return i18n.t('books.description')
    case WorkType.MOVIE:
      return i18n.t('movies.description')
    case WorkType.ARTICLE:
      return i18n.t('articles.description')
    case WorkType.COURSE:
      return i18n.t('courses.description')
    case WorkType.VIDEO:
      return i18n.t('videos.description')
  }
}

export function workFormNewTitle(type: WorkType): string {
  switch (type) {
    case WorkType.BOOK:
      return i18n.t('books.form.newTitle')
    case WorkType.MOVIE:
      return i18n.t('movies.form.newTitle')
    case WorkType.ARTICLE:
      return i18n.t('articles.form.newTitle')
    case WorkType.COURSE:
      return i18n.t('courses.form.newTitle')
    case WorkType.VIDEO:
      return i18n.t('videos.form.newTitle')
  }
}

export function workFormEditTitle(type: WorkType): string {
  switch (type) {
    case WorkType.BOOK:
      return i18n.t('books.form.editTitle')
    case WorkType.MOVIE:
      return i18n.t('movies.form.editTitle')
    case WorkType.ARTICLE:
      return i18n.t('articles.form.editTitle')
    case WorkType.COURSE:
      return i18n.t('courses.form.editTitle')
    case WorkType.VIDEO:
      return i18n.t('videos.form.editTitle')
  }
}

export function workFormNewDescription(type: WorkType): string {
  switch (type) {
    case WorkType.BOOK:
      return i18n.t('books.form.newDescription')
    case WorkType.MOVIE:
      return i18n.t('movies.form.newDescription')
    case WorkType.ARTICLE:
      return i18n.t('articles.form.newDescription')
    case WorkType.COURSE:
      return i18n.t('courses.form.newDescription')
    case WorkType.VIDEO:
      return i18n.t('videos.form.newDescription')
  }
}

export function workFormEditDescription(type: WorkType): string {
  switch (type) {
    case WorkType.BOOK:
      return i18n.t('books.form.editDescription')
    case WorkType.MOVIE:
      return i18n.t('movies.form.editDescription')
    case WorkType.ARTICLE:
      return i18n.t('articles.form.editDescription')
    case WorkType.COURSE:
      return i18n.t('courses.form.editDescription')
    case WorkType.VIDEO:
      return i18n.t('videos.form.editDescription')
  }
}

export function workStatusLabel(status: WorkStatus): string {
  switch (status) {
    case WorkStatus.TO_CONSUME:
      return i18n.t('work.status.toConsume')
    case WorkStatus.IN_PROGRESS:
      return i18n.t('work.status.inProgress')
    case WorkStatus.COMPLETED:
      return i18n.t('work.status.completed')
    case WorkStatus.ABANDONED:
      return i18n.t('work.status.abandoned')
  }
}

/** Maps onto DESIGN.md's primary/warning/destructive badge palette — no one-off hues. */
export const workStatusBadgeVariant: Record<
  WorkStatus,
  'secondary' | 'default' | 'outline' | 'destructive'
> = {
  [WorkStatus.TO_CONSUME]: 'secondary',
  [WorkStatus.IN_PROGRESS]: 'default',
  [WorkStatus.COMPLETED]: 'outline',
  [WorkStatus.ABANDONED]: 'destructive',
}

/** Dot color for the status quick-select popover — same primary/warning/destructive family. */
export const workStatusDotColor: Record<WorkStatus, string> = {
  [WorkStatus.TO_CONSUME]: 'bg-muted-foreground',
  [WorkStatus.IN_PROGRESS]: 'bg-primary',
  [WorkStatus.COMPLETED]: 'bg-foreground/70',
  [WorkStatus.ABANDONED]: 'bg-destructive',
}

/** Funnel-stage colors for the vault overview chart — reuses the same status
 * semantics as workStatusDotColor/-BadgeVariant (primary/destructive/neutral),
 * just as raw CSS values since Recharts needs a `fill`, not a Tailwind class. */
export const workFunnelStageColor = {
  entered: 'var(--muted-foreground)',
  in_progress: 'var(--primary)',
  completed: 'var(--foreground)',
  abandoned: 'var(--destructive)',
} as const

export function workFunnelStageLabel(
  stage: 'entered' | 'in_progress' | 'completed' | 'abandoned',
): string {
  switch (stage) {
    case 'entered':
      return i18n.t('work.status.entered')
    case 'in_progress':
      return i18n.t('work.status.inProgress')
    case 'completed':
      return i18n.t('work.status.completed')
    case 'abandoned':
      return i18n.t('work.status.abandoned')
  }
}

/** "3.2 days", "18h" — the single largest unit, for a compact stat tile. */
export function formatWishlistWait(avgSeconds: number | null): string {
  if (avgSeconds === null) return '—'
  if (avgSeconds < 3600) return '<1h'
  const days = avgSeconds / 86400
  return days >= 1
    ? i18n.t('work.units.days', { count: Number(days.toFixed(1)) })
    : i18n.t('work.units.hours', {
        count: Number((avgSeconds / 3600).toFixed(1)),
      })
}

/** Short detail line shown on a work card, e.g. "O'Reilly · 320 pages". */
export function formatWorkDetail(work: Work): string | null {
  if (!work.detail) return null

  switch (work.type) {
    case WorkType.BOOK: {
      const { publisher, pages } = work.detail
      return (
        [publisher, pages ? i18n.t('work.units.pages', { count: pages }) : null]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    case WorkType.MOVIE: {
      const { director, runtime_minutes } = work.detail
      return (
        [
          director,
          runtime_minutes
            ? i18n.t('work.units.minutes', { count: runtime_minutes })
            : null,
        ]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    case WorkType.ARTICLE: {
      const { source_name, reading_time_minutes } = work.detail
      return (
        [
          source_name,
          reading_time_minutes
            ? i18n.t('work.units.minutesReading', {
                count: reading_time_minutes,
              })
            : null,
        ]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    case WorkType.COURSE: {
      const { platform, instructor, duration_hours } = work.detail
      return (
        [
          platform,
          instructor,
          duration_hours
            ? i18n.t('work.units.hours', { count: duration_hours })
            : null,
        ]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    case WorkType.VIDEO: {
      const { platform, duration_minutes } = work.detail
      return (
        [
          platform,
          duration_minutes
            ? i18n.t('work.units.minutes', { count: duration_minutes })
            : null,
        ]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
  }
}
