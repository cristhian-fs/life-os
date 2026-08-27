import type {
  VaultDisplayPrefs,
  VaultGridColumns,
  VaultView,
} from '#/features/works/lib/vault-display-prefs'
import { VAULT_GRID_COLUMNS } from '#/features/works/lib/vault-display-prefs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { GridFourIcon, RowsIcon } from '@phosphor-icons/react'

export function VaultDisplayToggle({
  prefs,
  onChange,
}: {
  prefs: VaultDisplayPrefs
  onChange: (next: VaultDisplayPrefs) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {prefs.view === 'grid' && (
        <Select
          value={String(prefs.columns)}
          onValueChange={(v) =>
            onChange({ ...prefs, columns: Number(v) as VaultGridColumns })
          }
        >
          <SelectTrigger size="sm" className="w-[8.5rem]">
            <SelectValue>{(v: string) => `${v} columns`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {VAULT_GRID_COLUMNS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} columns
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <ToggleGroup
        value={[prefs.view]}
        onValueChange={(vals) => {
          const view = vals[0] as VaultView | undefined
          if (view) onChange({ ...prefs, view })
        }}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <GridFourIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <RowsIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
