import { useUpdatePurchaseWishlist } from '#/features/purchase-wishlist/api/update-purchase-wishlist'
import { linkableWorks } from '#/features/purchase-wishlist/lib/linkable-works'
import { useWorks } from '#/features/works/api/get-works'
import { workTypeLabel } from '#/features/works/lib/format'
import type { PurchaseWishlist } from '#/types/api'
import { toast } from '#/components/ui/toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

const NONE = 'none'

/**
 * Links a wishlist item to one of the user's to-consume works. Only
 * to_consume works are offered — once a work is started or done it's no
 * longer something you're still shopping for.
 */
export function PurchaseWishlistWorkSelect({
  item,
}: {
  item: PurchaseWishlist
}) {
  const { t } = useTranslation()
  const works = useWorks()
  const updateItem = useUpdatePurchaseWishlist({
    mutationConfig: {
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const candidates = linkableWorks(works.data ?? [], item.work_id)
  // The linked work can fall out of the to_consume filter (started/finished
  // elsewhere) — look it up separately so the trigger still shows its title.
  const linkedWork = works.data?.find((w) => w.id === item.work_id)

  return (
    <Select
      value={item.work_id ?? NONE}
      onValueChange={(v) =>
        updateItem.mutate({
          id: item.id,
          data: { work_id: v === NONE ? null : v },
        })
      }
      disabled={works.isLoading || updateItem.isPending}
    >
      <SelectTrigger size="sm" className="w-full max-w-56">
        <SelectValue>
          {() =>
            linkedWork
              ? `${linkedWork.title} · ${workTypeLabel(linkedWork.type)}`
              : t('purchaseWishlist.noWorkLinked')
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>
          {t('purchaseWishlist.noWorkLinked')}
        </SelectItem>
        {candidates.map((work) => (
          <SelectItem key={work.id} value={work.id}>
            {work.title} · {workTypeLabel(work.type)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
