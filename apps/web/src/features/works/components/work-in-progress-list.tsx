import { useWorks } from '#/features/works/api/get-works'
import { WorkCard } from '#/features/works/components/work-card'
import { WorkStatus } from '#/types/api'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

const MAX_ITEMS = 5

/** "In progress" widget for the dashboard overview — the actual work items,
 * not just a count, reusing WorkCard as-is (status popover, progress
 * actions, edit/delete menu all work right here). Owns its own query so the
 * route stays layout-only. */
export function WorkInProgressList() {
  const works = useWorks()
  const { t } = useTranslation('translations')

  if (works.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-[68px] rounded-lg" />
        ))}
      </div>
    )
  }

  const inProgress = (works.data ?? [])
    .filter((work) => work.status === WorkStatus.IN_PROGRESS)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, MAX_ITEMS)

  if (inProgress.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('dashboard.noActiveProgress')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {inProgress.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  )
}
