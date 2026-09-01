import { WorkStatus } from '#/types/api'
import type { Work } from '#/types/api'

/**
 * Works offerable to link a wishlist item to: only to_consume ones (you're
 * still shopping for those), plus whatever's already linked even if it since
 * moved on — otherwise picking it would silently disappear from the list.
 */
export function linkableWorks(
  works: Work[],
  currentWorkId: string | null,
): Work[] {
  return works.filter(
    (w) => w.status === WorkStatus.TO_CONSUME || w.id === currentWorkId,
  )
}
