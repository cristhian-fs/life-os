import i18n from '#/i18n'
import { TopicStatus } from '#/types/api'

export function topicStatusLabel(status: TopicStatus): string {
  switch (status) {
    case TopicStatus.NOT_STARTED:
      return i18n.t('study.status.notStarted')
    case TopicStatus.IN_PROGRESS:
      return i18n.t('study.status.inProgress')
    case TopicStatus.MASTERED:
      return i18n.t('study.status.mastered')
  }
}

export const topicStatusBadgeVariant: Record<
  TopicStatus,
  'secondary' | 'default' | 'outline'
> = {
  [TopicStatus.NOT_STARTED]: 'secondary',
  [TopicStatus.IN_PROGRESS]: 'default',
  [TopicStatus.MASTERED]: 'outline',
}

/** Dot color for the status quick-select popover. */
export const topicStatusDotColor: Record<TopicStatus, string> = {
  [TopicStatus.NOT_STARTED]: 'bg-muted-foreground',
  [TopicStatus.IN_PROGRESS]: 'bg-primary',
  [TopicStatus.MASTERED]: 'bg-foreground/70',
}
