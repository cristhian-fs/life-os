import { formatWorkDetail, workTypeIcon } from '#/features/works/lib/format'
import type { Work } from '#/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowSquareOutIcon, StarIcon } from '@phosphor-icons/react'
import { WorkActionsMenu } from './work-actions-menu'
import { WorkProgressActions } from './work-progress-actions'
import { WorkStatusPopover } from './work-status-popover'

export function WorkCard({ work }: { work: Work }) {
  const Icon = workTypeIcon[work.type]
  const detailLine = formatWorkDetail(work)

  return (
    <Card className="bg-transparent">
      <CardContent className="flex items-center gap-3">
        {work.image_url ? (
          <img
            src={work.image_url}
            alt=""
            className="size-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium">{work.title}</p>
            {work.external_url && (
              <a
                href={work.external_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open link"
              >
                <ArrowSquareOutIcon className="size-3.5" />
              </a>
            )}
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {[work.creator, detailLine].filter(Boolean).join(' · ')}
          </p>
        </div>
        {work.rating !== null && (
          <div
            className="flex shrink-0 items-center gap-0.5 text-muted-foreground"
            aria-label={`Rated ${work.rating} out of 5`}
          >
            <StarIcon weight="fill" className="size-3.5 text-primary" />
            <span className="text-xs">{work.rating}</span>
          </div>
        )}
        <WorkProgressActions work={work} />
        <WorkStatusPopover work={work} />
        <WorkActionsMenu work={work} />
      </CardContent>
    </Card>
  )
}
