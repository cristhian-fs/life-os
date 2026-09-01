import { useLocalStorage } from '#/hooks/use-local-storage'
import type { WorkType } from '#/types/api'

export type VaultView = 'grid' | 'list'

export const VAULT_GRID_COLUMNS = [2, 3, 4, 5] as const
export type VaultGridColumns = (typeof VAULT_GRID_COLUMNS)[number]

export type VaultDisplayPrefs = {
  view: VaultView
  columns: VaultGridColumns
}

const DEFAULT_PREFS: VaultDisplayPrefs = { view: 'grid', columns: 3 }

/** Own key per work type — books can stay grid while movies is list, not one setting shared across the whole vault. */
export function useVaultDisplayPrefs(type: WorkType) {
  return useLocalStorage(`vault:display-prefs:${type}`, DEFAULT_PREFS)
}
