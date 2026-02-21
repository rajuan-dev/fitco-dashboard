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

export function normalizeDashboard(payload = {}) {
  return {
    totalUsers: pick(payload, ['totalUsers', 'total_users', 'usersTotal', 'users_total'], '0'),
    totalRevenue: pick(payload, ['totalRevenue', 'total_revenue', 'revenueTotal', 'revenue_total'], '0'),
    userRatio: pick(payload, ['userRatio', 'user_ratio', 'monthlyUsers', 'monthly_users'], Array(12).fill(0)),
  }
}

export function normalizeUsers(payload) {
  const rows = toRows(payload, ['users'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(pick(row, ['id', 'sid', 'userId', 'user_id'], null), index),
    name: pick(row, ['name', 'fullName', 'full_name', 'userName', 'user_name'], 'Unknown User'),
    email: pick(row, ['email'], EMPTY),
    phone: pick(row, ['phone', 'phoneNo', 'phone_no'], EMPTY),
    joinedDate: normalizeDate(pick(row, ['joinedDate', 'joined_date', 'date', 'created_at'], EMPTY)),
  }))
}

export function normalizeEarnings(payload = {}) {
  return {
    today: pick(payload, ['today', 'today_amount'], '0'),
    thisMonth: pick(payload, ['thisMonth', 'this_month'], '0'),
    totalRevenue: pick(payload, ['totalRevenue', 'total_revenue'], '0'),
  }
}

export function normalizeTransactions(payload) {
  const rows = toRows(payload, ['transactions'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(pick(row, ['id', 'sid', 'transactionId', 'transaction_id'], null), index),
    userId: pick(row, ['userId', 'user_id', 'uid'], null),
    name: pick(row, ['name', 'userName', 'user_name', 'fullName', 'full_name'], 'Unknown User'),
    trxId: pick(row, ['trxId', 'transaction_id', 'transactionId', 'reference'], '#-'),
    plan: pick(row, ['plan', 'plans', 'package', 'subscriptionPlan'], EMPTY),
    price: normalizeCurrency(pick(row, ['price', 'amount', 'totalAmount', 'total_amount'], '$0.00')),
    date: normalizeDate(pick(row, ['date', 'created_at', 'createdAt'], EMPTY)),
  }))
}

export function normalizeSubscriptions(payload) {
  const rows = toRows(payload, ['subscriptions'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(pick(row, ['id', 'sid', 'subscriptionId', 'subscription_id'], null), index),
    userId: pick(row, ['userId', 'user_id', 'uid'], null),
    name: pick(row, ['name', 'userName', 'user_name', 'fullName', 'full_name'], 'Unknown User'),
    email: pick(row, ['email'], EMPTY),
    status: pick(row, ['status', 'paymentStatus', 'payment_status'], EMPTY),
    plan: pick(row, ['plan', 'plans', 'subscriptionPlan', 'package'], EMPTY),
    expirationDate: normalizeDate(pick(row, ['expirationDate', 'expiration_date', 'date', 'endDate', 'end_date'], EMPTY)),
  }))
}

export function normalizeReports(payload) {
  const rows = toRows(payload, ['reports'])
  return rows.map((row, index) => ({
    id: normalizeIdentifier(pick(row, ['id', 'sid', 'reportId', 'report_id'], null), index),
    userId: pick(row, ['userId', 'user_id', 'reportedUserId', 'reported_user_id'], null),
    name: pick(row, ['name', 'reportFrom', 'report_from', 'reportedByName', 'reported_by_name'], 'Unknown User'),
    email: pick(row, ['email', 'reportedByEmail', 'reported_by_email'], EMPTY),
    reason: pick(row, ['reason', 'reportReason', 'report_reason'], EMPTY),
    reportedAt: normalizeDate(pick(row, ['reportedAt', 'date', 'created_at', 'createdAt'], EMPTY)),
  }))
}

export function normalizeProfile(payload = {}) {
  return {
    username: pick(payload, ['username', 'userName', 'user_name'], EMPTY),
    email: pick(payload, ['email'], EMPTY),
    contactNo: pick(payload, ['contactNo', 'contact_no', 'phone'], EMPTY),
    name: pick(payload, ['name', 'fullName', 'full_name'], 'Admin'),
  }
}
