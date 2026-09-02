import { useWorks } from '#/features/works/api/get-works'
import { VaultDisplayToggle } from '#/features/works/components/vault-display-toggle'
import { WorkCard } from '#/features/works/components/work-card'
import { WorkFormDialog } from '#/features/works/components/work-form-dialog'
import { WorkGridCard } from '#/features/works/components/work-grid-card'
import {
  EmptyWorks,
  WorkListSkeleton,
} from '#/features/works/components/work-list-states'
import {
  workFormNewTitle,
  workTypeLabel,
  workTypeSubtitle,
} from '#/features/works/lib/format'
import { useVaultDisplayPrefs } from '#/features/works/lib/vault-display-prefs'
import type { WorkType } from '#/types/api'
import { Button } from '@/components/ui/button'
import type { Icon } from '@phosphor-icons/react'
import { PlusIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

/** Shared list page for one vault type — routes just pick a `type` and an icon. */
export function VaultTypePage({ type, icon }: { type: WorkType; icon: Icon }) {
  // Subscribes to language changes so workTypeLabel()/etc (which read the
  // global i18n singleton, not this hook) re-render correctly on switch.
  useTranslation()
  const works = useWorks()
  const items = works.data?.filter((w) => w.type === type) ?? []
  const [prefs, setPrefs] = useVaultDisplayPrefs(type)

  return (
    <div className="flex flex-col gap-6 py-6 px-2 h-full">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl tracking-tight font-medium">
              {workTypeLabel(type)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {workTypeSubtitle(type)}
            </p>
          </div>
          <WorkFormDialog
            type={type}
            trigger={
              <Button>
                <PlusIcon />
                {workFormNewTitle(type)}
              </Button>
            }
          />
        </div>
      </div>

      {works.isLoading ? (
        <WorkListSkeleton />
      ) : items.length === 0 ? (
        <EmptyWorks type={type} icon={icon} />
      ) : (
        <div className="flex h-full flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="mx-auto flex w-full max-w-4xl justify-end">
            <VaultDisplayToggle prefs={prefs} onChange={setPrefs} />
          </div>
          {prefs.view === 'grid' ? (
            <div
              className="mx-auto grid w-full max-w-4xl gap-4"
              style={{
                gridTemplateColumns: `repeat(${prefs.columns}, minmax(0, 1fr))`,
              }}
            >
              {items.map((work) => (
                <WorkGridCard key={work.id} work={work} />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4">
              {items.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
