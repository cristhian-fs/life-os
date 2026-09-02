import { formatWorkDetail, workTypeIcon } from '#/features/works/lib/format'
import { WorkType, type Work } from '#/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { WorkActionsMenu } from './work-actions-menu'
import { WorkProgressActions } from './work-progress-actions'
import { WorkStatusPopover } from './work-status-popover'
import { cn } from '#/lib/utils'
import { useTranslation } from 'react-i18next'

/** Poster-style card for grid view — vertical, cover art up top. */
export function WorkGridCard({ work }: { work: Work }) {
  // Subscribes to language changes so formatWorkDetail() (which reads the
  // global i18n singleton, not this hook) re-renders correctly on switch.
  useTranslation()
  const Icon = workTypeIcon[work.type]
  const detailLine = formatWorkDetail(work)

  return (
    <Card className="gap-0 overflow-hidden bg-transparent p-0">
      <div
        className={cn('relative w-full overflow-hidden bg-muted', {
          'aspect-video':
            work.type === WorkType.VIDEO || work.type === WorkType.ARTICLE,
          'aspect-square':
            work.type !== WorkType.VIDEO && work.type !== WorkType.ARTICLE,
        })}
      >
        {work.image_url ? (
          <img
            src={work.image_url}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Icon className="size-8" />
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 rounded-md bg-background/80 backdrop-blur-xs">
          <WorkActionsMenu work={work} />
        </div>
      </div>
      <CardContent className="flex flex-col gap-1.5 p-3">
        <p className="truncate text-sm font-medium">{work.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {[work.creator, detailLine].filter(Boolean).join(' · ')}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <WorkStatusPopover work={work} />
          <WorkProgressActions work={work} />
        </div>
      </CardContent>
    </Card>
  )
}
