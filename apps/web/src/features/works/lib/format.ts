import { WorkStatus, WorkType } from '#/types/api'
import type { Work } from '#/types/api'
import type { Icon } from '@phosphor-icons/react'
import {
  BooksIcon,
  FilmReelIcon,
  GraduationCapIcon,
  NewspaperIcon,
} from '@phosphor-icons/react'

export const workTypeLabel: Record<WorkType, string> = {
  [WorkType.BOOK]: 'Book',
  [WorkType.MOVIE]: 'Movie',
  [WorkType.ARTICLE]: 'Article',
  [WorkType.COURSE]: 'Course',
}

export const workTypeIcon: Record<WorkType, Icon> = {
  [WorkType.BOOK]: BooksIcon,
  [WorkType.MOVIE]: FilmReelIcon,
  [WorkType.ARTICLE]: NewspaperIcon,
  [WorkType.COURSE]: GraduationCapIcon,
}

/** Inviting subhead under the "{Label}s" heading on each vault type page. */
export const workTypeSubtitle: Record<WorkType, string> = {
  [WorkType.BOOK]:
    'Keep track of what you’re reading and what’s next on the shelf.',
  [WorkType.MOVIE]: 'Log what you’ve watched and queue up what’s next.',
  [WorkType.ARTICLE]:
    'Save what you’re reading and revisit it whenever you like.',
  [WorkType.COURSE]: 'Track what you’re learning, one lesson at a time.',
}

export const workStatusLabel: Record<WorkStatus, string> = {
  [WorkStatus.TO_CONSUME]: 'To consume',
  [WorkStatus.IN_PROGRESS]: 'In progress',
  [WorkStatus.COMPLETED]: 'Completed',
  [WorkStatus.ABANDONED]: 'Abandoned',
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

/** Short detail line shown on a work card, e.g. "O'Reilly · 320 pages". */
export function formatWorkDetail(work: Work): string | null {
  if (!work.detail) return null

  switch (work.type) {
    case WorkType.BOOK: {
      const { publisher, pages } = work.detail
      return (
        [publisher, pages ? `${pages} pages` : null]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    case WorkType.MOVIE: {
      const { director, runtime_minutes } = work.detail
      return (
        [director, runtime_minutes ? `${runtime_minutes} min` : null]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    case WorkType.ARTICLE: {
      const { source_name, reading_time_minutes } = work.detail
      return (
        [
          source_name,
          reading_time_minutes ? `${reading_time_minutes} min read` : null,
        ]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    case WorkType.COURSE: {
      const { platform, instructor, duration_hours } = work.detail
      return (
        [platform, instructor, duration_hours ? `${duration_hours}h` : null]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
  }
}
