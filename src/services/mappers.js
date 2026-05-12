import { formatCurrencyDisplay, normalizeCurrencyCode, REPORTING_CURRENCY } from '../utils/currency'

const EMPTY = '-'
const regionNames = typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null

function pick(obj, keys, fallback = EMPTY) {
  for (const key of keys) {
    const value = obj?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return fallback
}

function toRows(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function normalizeIdentifier(value, index) {
  if (value === undefined || value === null || value === '') {
    return String(index + 1).padStart(2, '0')
  }
  return String(value)
}

function unwrapValue(value) {
  if (value && typeof value === 'object' && 'toString' in value) {
    const stringified = value.toString()
    if (stringified && stringified !== '[object Object]') return stringified
  }
  return value
}

function normalizeDate(value) {
  if (!value) return EMPTY
  if (typeof value !== 'string') return String(value)
  const trimmed = value.trim()
  return trimmed || EMPTY
}

function formatCurrencyValue(amount, currency = REPORTING_CURRENCY) {
  return formatCurrencyDisplay(amount, currency)
}

function normalizeRevenueValue(value, currency = REPORTING_CURRENCY) {
  if (value === undefined || value === null || value === '') return formatCurrencyDisplay(0, currency)
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return formatCurrencyDisplay(numeric, currency)
  return 'N/A'
}

function normalizeJoinedDate(value) {
  if (!value) return EMPTY
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return normalizeDate(value)
  }
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}-${day}-${year}`
}

function normalizeDateTime(value) {
  if (!value) return EMPTY
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return normalizeDate(value)
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function formatRegionLabel(value) {
  const code = String(value || '').trim().toUpperCase()
  if (!/^[A-Z]{2,3}$/.test(code)) return null
  try {
    return regionNames?.of(code) || code
  } catch {
    return code
  }
}

function resolveTransactionId(row, userId, index) {
  const candidates = [
    row?.transactionId,
    row?.transaction_id,
    row?._id,
    row?.sid,
    row?.reference,
    row?.stripeInvoiceId,
    row?.stripeCheckoutSessionId,
  ]

  for (const candidate of candidates) {
    const value = unwrapValue(candidate)
    if (value === undefined || value === null || value === '') continue
    if (String(value) === String(userId || '')) continue
    return normalizeIdentifier(value, index)
  }

  return normalizeIdentifier(null, index)
}

function toDisplayTransactionId(transactionId, reference) {
  const ref = reference && reference !== EMPTY ? String(reference).trim() : ''
  if (ref) {
    if (ref.startsWith('stripe_') || ref.startsWith('cs_') || ref.startsWith('pi_')) {
      return `TXN-${ref.slice(-8).toUpperCase()}`
    }
    return ref
  }
  const id = String(transactionId || '').trim()
  if (!id) return 'TXN-NA'
  return `TXN-${id.slice(-8).toUpperCase()}`
}

export function normalizeDashboard(payload = {}) {
  const baseCurrency = normalizeCurrencyCode(pick(payload, ['baseCurrency', 'base_currency'], REPORTING_CURRENCY), REPORTING_CURRENCY)
  return {
    totalUsers: pick(payload, ['totalUsers', 'total_users', 'usersTotal', 'users_total'], '0'),
    totalRevenue: normalizeRevenueValue(pick(payload, ['totalRevenue', 'total_revenue', 'revenueTotal', 'revenue_total'], '0'), baseCurrency),
    userRatio: pick(payload, ['userRatio', 'user_ratio', 'monthlyUsers', 'monthly_users'], Array(12).fill(0)),
  }
}

export function normalizeUsers(payload) {
  const rows = toRows(payload, ['users'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(unwrapValue(pick(row, ['id', '_id', 'sid', 'userId', 'user_id'], null)), index),
    name: pick(row, ['name', 'fullName', 'full_name', 'userName', 'user_name'], 'Unknown User'),
    email: pick(row, ['email'], EMPTY),
    phone: pick(row, ['phone', 'phoneNo', 'phone_no'], EMPTY),
    joinedDate: normalizeJoinedDate(pick(row, ['joinedDate', 'joined_date', 'date', 'createdAt', 'created_at'], EMPTY)),
    createdAt: pick(row, ['createdAt', 'created_at', 'joinedDate', 'joined_date', 'date'], null),
    isBlocked: Boolean(pick(row, ['isBlocked', 'is_blocked'], false)),
  }))
}

export function normalizeEarnings(payload = {}) {
  const baseCurrency = normalizeCurrencyCode(pick(payload, ['baseCurrency', 'base_currency'], REPORTING_CURRENCY), REPORTING_CURRENCY)
  return {
    today: normalizeRevenueValue(pick(payload, ['today', 'today_amount'], '0'), baseCurrency),
    thisMonth: normalizeRevenueValue(pick(payload, ['thisMonth', 'this_month'], '0'), baseCurrency),
    totalRevenue: normalizeRevenueValue(pick(payload, ['totalRevenue', 'total_revenue'], '0'), baseCurrency),
    baseCurrency,
  }
}

export function normalizeTransactions(payload) {
  const rows = toRows(payload, ['transactions'])
  return rows.map((row, index) => {
    const userId = unwrapValue(pick(row, ['userId', 'user_id', 'uid', 'user._id'], row?.user?._id || null))
    const transactionId = resolveTransactionId(row, userId, index)
    const reference = pick(row, ['reference', 'trxId', 'transaction_id', 'transactionId'], '#-')
    const originalAmount = row?.meta?.originalAmount
    const originalCurrency = normalizeCurrencyCode(row?.meta?.originalCurrency || row?.currency || REPORTING_CURRENCY, REPORTING_CURRENCY)
    const originalRegion = row?.meta?.originalRegion || row?.meta?.territory || row?.meta?.regionCode || null
    const reportingAmount = row?.meta?.reportingAmount
    const reportingCurrency = normalizeCurrencyCode(row?.meta?.reportingCurrency || REPORTING_CURRENCY, REPORTING_CURRENCY)
    const hasOriginalPrice = originalAmount !== undefined && originalAmount !== null && row?.meta?.originalCurrency
    const originalPrice = hasOriginalPrice
      ? formatCurrencyValue(originalAmount, originalCurrency)
      : formatCurrencyValue(pick(row, ['amount', 'price', 'totalAmount', 'total_amount'], 0), originalCurrency)
    const normalizedReportingPrice =
      reportingAmount !== undefined && reportingAmount !== null
        ? formatCurrencyValue(reportingAmount, reportingCurrency)
        : 'N/A'
    const showReportingPrice = normalizedReportingPrice !== 'N/A'
    const displayPrice = showReportingPrice ? normalizedReportingPrice : originalPrice
    const showOriginalPrice = showReportingPrice && originalPrice !== normalizedReportingPrice
    const originalRegionLabel = formatRegionLabel(originalRegion)
    return {
      id: normalizeIdentifier(unwrapValue(pick(row, ['_id', 'transactionId', 'transaction_id', 'sid', 'id'], null)), index),
      transactionId,
      displayTransactionId: toDisplayTransactionId(transactionId, reference),
      userId,
      name: pick(row, ['name', 'userName', 'user_name', 'fullName', 'full_name'], row?.user?.name || 'Unknown User'),
      email: pick(row, ['email', 'userEmail', 'user_email'], row?.user?.email || EMPTY),
      trxId: pick(row, ['trxId', 'transaction_id', 'transactionId', 'reference'], '#-'),
      reference,
      platform: pick(row, ['platform', 'source'], row?.meta?.platform || EMPTY),
      plan: pick(row, ['plan', 'plans', 'package', 'subscriptionPlan', 'planType'], EMPTY),
      price: displayPrice,
      originalPrice,
      reportingPrice: normalizedReportingPrice,
      showReportingPrice,
      showOriginalPrice,
      originalRegionLabel,
      baseCurrency: REPORTING_CURRENCY,
      date: normalizeDateTime(pick(row, ['date', 'created_at', 'createdAt'], row?.createdAt || EMPTY)),
      status: pick(row, ['status', 'paymentStatus', 'payment_status'], EMPTY),
      accountNo: pick(row, ['accountNo', 'accountNumber', 'account_no'], row?.meta?.last4 ? `**** **** **** ${row.meta.last4}` : EMPTY),
    }
  })
}

export function normalizeSubscriptions(payload) {
  const rows = toRows(payload, ['subscriptions'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(unwrapValue(pick(row, ['id', '_id', 'sid', 'subscriptionId', 'subscription_id'], null)), index),
    userId: unwrapValue(pick(row, ['userId', 'user_id', 'uid'], row?.user?._id || null)),
    name: pick(row, ['name', 'userName', 'user_name', 'fullName', 'full_name'], row?.user?.name || 'Unknown User'),
    email: pick(row, ['email'], row?.user?.email || EMPTY),
    status: pick(row, ['status', 'paymentStatus', 'payment_status'], EMPTY),
    statusLabel:
      pick(row, ['status', 'paymentStatus', 'payment_status'], EMPTY) === 'active'
        ? 'Active'
        : pick(row, ['status', 'paymentStatus', 'payment_status'], EMPTY) === 'expired'
          ? 'Expired'
          : String(pick(row, ['status', 'paymentStatus', 'payment_status'], EMPTY)).replace(/_/g, ' '),
    platform: pick(row, ['platform', 'source'], EMPTY),
    isActive: Boolean(pick(row, ['isActive', 'is_active'], false)),
    plan: pick(row, ['plan', 'plans', 'subscriptionPlan', 'package', 'planType'], EMPTY),
    expirationDate: normalizeDateTime(pick(row, ['expirationDate', 'expiration_date', 'date', 'endDate', 'end_date', 'createdAt', 'created_at'], row?.expiryDate || EMPTY)),
    hasSubscription: true,
  }))
}

export function normalizeReports(payload) {
  const rows = toRows(payload, ['reports'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(unwrapValue(pick(row, ['id', '_id', 'sid', 'reportId', 'report_id'], null)), index),
    userId: unwrapValue(pick(row, ['userId', 'user_id', 'reportedUserId', 'reported_user_id'], row?.user?._id || null)),
    name: pick(row, ['name', 'reportFrom', 'report_from', 'reportedByName', 'reported_by_name'], row?.user?.name || 'Unknown User'),
    email: row?.user?.email || EMPTY,
    reason: pick(row, ['reason', 'reportReason', 'report_reason', 'issueType'], EMPTY),
    description: pick(row, ['description', 'details', 'message'], EMPTY),
    status: pick(row, ['status'], 'open'),
    reportedAt: normalizeDateTime(pick(row, ['reportedAt', 'date', 'created_at', 'createdAt'], row?.createdAt || EMPTY)),
  }))
}

export function normalizeProfile(payload = {}) {
  return {
    username: pick(payload, ['username', 'userName', 'user_name', 'name', 'fullName', 'full_name'], ''),
    firstName: pick(payload, ['firstName', 'first_name'], ''),
    lastName: pick(payload, ['lastName', 'last_name'], ''),
    email: pick(payload, ['email'], EMPTY),
    contactNo: pick(payload, ['contactNo', 'contact_no', 'phone'], EMPTY),
    name: pick(payload, ['name', 'fullName', 'full_name', 'username', 'userName', 'user_name'], 'Admin'),
  }
}
