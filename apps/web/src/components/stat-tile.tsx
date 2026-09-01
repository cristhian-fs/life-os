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
    <div className="flex flex-col gap-1">
      <p className="relative text-xs text-muted-foreground before:absolute before:top-0 before:-left-2 before:h-full before:w-0.5 before:rounded-sm before:bg-border before:content-['']">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-6 w-26" />
      ) : (
        <p className="relative text-xl font-medium tabular-nums before:absolute before:top-0 before:-left-2 before:h-full before:w-0.5 before:rounded-sm before:bg-muted before:content-['']">
          {value}{' '}
          <span className="text-xs font-normal text-muted-foreground">
            {suffix}
          </span>
        </p>
      )}
    </div>
  )
}
