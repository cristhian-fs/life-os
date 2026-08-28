import { Skeleton } from '@/components/ui/skeleton'

export function StatTile({
  label,
  value,
  suffix,
  loading,
}: {
  label: string
  value: number | string
  suffix: string
  loading?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 px-2">
      <p className="relative pl-3 text-xs text-muted-foreground before:absolute before:top-0 before:left-0 before:h-full before:w-0.5 before:rounded-sm before:bg-border before:content-['']">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <p className="relative pl-3 text-xl font-medium tabular-nums before:absolute before:top-0 before:left-0 before:h-full before:w-0.5 before:rounded-sm before:bg-muted before:content-['']">
          {value}{' '}
          <span className="text-xs font-normal text-muted-foreground">
            {suffix}
          </span>
        </p>
      )}
    </div>
  )
}
