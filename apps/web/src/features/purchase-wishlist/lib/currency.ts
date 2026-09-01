/** Currencies offered on the wishlist form — all minor-unit-100 (cents), so
 * the same integer-cents storage works for every preset without a
 * per-currency decimal-digit lookup. */
export const CURRENCY_PRESETS = [
  { code: 'USD', locale: 'en-US', label: 'USD ($)' },
  { code: 'BRL', locale: 'pt-BR', label: 'BRL (R$)' },
  { code: 'EUR', locale: 'de-DE', label: 'EUR (€)' },
  { code: 'CNY', locale: 'zh-CN', label: 'CNY (¥)' },
] as const

export type CurrencyCode = (typeof CURRENCY_PRESETS)[number]['code']

const localeByCode: Record<string, string> = Object.fromEntries(
  CURRENCY_PRESETS.map((c) => [c.code, c.locale]),
)

/** Falls back to USD's locale for any currency saved before a preset existed. */
export function formatMoney(
  cents: number | null,
  currency: string | null,
): string {
  if (cents === null) return '—'
  const code = currency ?? 'USD'
  return (cents / 100).toLocaleString(localeByCode[code] ?? 'en-US', {
    style: 'currency',
    currency: code,
  })
}
