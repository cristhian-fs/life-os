import { formatMoney } from '#/features/purchase-wishlist/lib/currency'
import { Input } from '@/components/ui/input'

export function MoneyInput({
  cents,
  currency,
  onChange,
  disabled,
  id,
}: {
  cents: number | null
  currency: string
  onChange: (cents: number | null) => void
  disabled?: boolean
  id?: string
}) {
  return (
    <Input
      id={id}
      inputMode="numeric"
      placeholder={formatMoney(0, currency)}
      value={cents === null ? '' : formatMoney(cents, currency)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '')
        onChange(digits === '' ? null : Number(digits))
      }}
      disabled={disabled}
    />
  )
}
