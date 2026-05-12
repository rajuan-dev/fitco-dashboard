export const REPORTING_CURRENCY = 'SAR'

const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function normalizeCurrencyCode(value, fallback = REPORTING_CURRENCY) {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
  return /^[A-Z]{3}$/.test(normalized) ? normalized : fallback
}

export function formatCurrencyDisplay(amount, currency = REPORTING_CURRENCY, fallback = 'N/A') {
  const numeric = Number(amount)
  const code = normalizeCurrencyCode(currency, REPORTING_CURRENCY)
  if (!Number.isFinite(numeric)) return fallback
  return `${code} ${decimalFormatter.format(numeric)}`
}
