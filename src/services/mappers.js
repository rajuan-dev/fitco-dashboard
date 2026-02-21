const EMPTY = '-'

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

function normalizeCurrency(value) {
  if (value === undefined || value === null || value === '') return '$0.00'
  if (typeof value === 'number') return `$${value.toFixed(2)}`
  const text = String(value).trim()
  if (!text) return '$0.00'
  return text.startsWith('$') ? text : /^\d+(\.\d+)?$/.test(text) ? `$${text}` : text
}

function normalizeRevenueValue(value) {
  if (value === undefined || value === null || value === '') return '$0.00'
  if (typeof value === 'number') return `$${value.toFixed(2)}`
  const text = String(value).trim()
  if (!text) return '$0.00'
  if (text.startsWith('$')) {
    const numeric = Number(text.replace('$', '').trim())
    return Number.isFinite(numeric) ? `$${numeric.toFixed(2)}` : text
  }
  const numeric = Number(text)
  if (Number.isFinite(numeric)) return `$${numeric.toFixed(2)}`
  return text
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
  return {
    totalUsers: pick(payload, ['totalUsers', 'total_users', 'usersTotal', 'users_total'], '0'),
    totalRevenue: normalizeRevenueValue(pick(payload, ['totalRevenue', 'total_revenue', 'revenueTotal', 'revenue_total'], '0')),
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
    isBlocked: Boolean(pick(row, ['isBlocked', 'is_blocked'], false)),
  }))
}

export function normalizeEarnings(payload = {}) {
  return {
    today: normalizeRevenueValue(pick(payload, ['today', 'today_amount'], '0')),
    thisMonth: normalizeRevenueValue(pick(payload, ['thisMonth', 'this_month'], '0')),
    totalRevenue: normalizeRevenueValue(pick(payload, ['totalRevenue', 'total_revenue'], '0')),
  }
}

export function normalizeTransactions(payload) {
  const rows = toRows(payload, ['transactions'])
  return rows.map((row, index) => {
    const userId = unwrapValue(pick(row, ['userId', 'user_id', 'uid', 'user._id'], row?.user?._id || null))
    const transactionId = resolveTransactionId(row, userId, index)
    const reference = pick(row, ['reference', 'trxId', 'transaction_id', 'transactionId'], '#-')
    return {
      id: normalizeIdentifier(unwrapValue(pick(row, ['_id', 'transactionId', 'transaction_id', 'sid', 'id'], null)), index),
      transactionId,
      displayTransactionId: toDisplayTransactionId(transactionId, reference),
      userId,
      name: pick(row, ['name', 'userName', 'user_name', 'fullName', 'full_name'], row?.user?.name || 'Unknown User'),
      email: pick(row, ['email', 'userEmail', 'user_email'], row?.user?.email || EMPTY),
      trxId: pick(row, ['trxId', 'transaction_id', 'transactionId', 'reference'], '#-'),
      reference,
      plan: pick(row, ['plan', 'plans', 'package', 'subscriptionPlan', 'planType'], EMPTY),
      price: normalizeCurrency(pick(row, ['price', 'amount', 'totalAmount', 'total_amount'], '$0.00')),
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
    status: pick(row, ['status', 'paymentStatus', 'payment_status'], EMPTY) === 'active' ? 'Paid' : 'Unpaid',
    plan: pick(row, ['plan', 'plans', 'subscriptionPlan', 'package', 'planType'], EMPTY),
    expirationDate: normalizeDateTime(pick(row, ['expirationDate', 'expiration_date', 'date', 'endDate', 'end_date', 'createdAt', 'created_at'], row?.expiryDate || EMPTY)),
  }))
}

export function normalizeReports(payload) {
  const rows = toRows(payload, ['reports'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(unwrapValue(pick(row, ['id', '_id', 'sid', 'reportId', 'report_id'], null)), index),
    userId: unwrapValue(pick(row, ['userId', 'user_id', 'reportedUserId', 'reported_user_id'], row?.user?._id || null)),
    name: pick(row, ['name', 'reportFrom', 'report_from', 'reportedByName', 'reported_by_name'], row?.user?.name || 'Unknown User'),
    email: pick(row, ['email', 'reportedByEmail', 'reported_by_email'], row?.user?.email || EMPTY),
    reason: pick(row, ['reason', 'reportReason', 'report_reason', 'issueType'], EMPTY),
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
