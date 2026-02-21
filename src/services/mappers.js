export function normalizeDashboard(payload = {}) {
  return {
    totalUsers: payload.totalUsers || payload.total_users || payload.usersTotal || '0',
    totalRevenue: payload.totalRevenue || payload.total_revenue || payload.revenueTotal || '0',
    userRatio: payload.userRatio || payload.user_ratio || payload.monthlyUsers || Array(12).fill(0),
  }
}

export function normalizeUsers(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || payload?.users || []
  return rows.map((row, index) => ({
    id: row.id || row.sid || `0${index + 1}`,
    name: row.name || row.fullName || row.full_name || 'Unknown User',
    email: row.email || '-',
    phone: row.phone || row.phoneNo || row.phone_no || '-',
    joinedDate: row.joinedDate || row.joined_date || row.date || '-',
  }))
}

export function normalizeEarnings(payload = {}) {
  return {
    today: payload.today || payload.today_amount || '0',
    thisMonth: payload.thisMonth || payload.this_month || '0',
    totalRevenue: payload.totalRevenue || payload.total_revenue || '0',
  }
}

export function normalizeTransactions(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || payload?.transactions || []
  return rows.map((row, index) => ({
    id: row.id || row.sid || `0${index + 1}`,
    name: row.name || row.userName || row.user_name || 'Unknown User',
    trxId: row.trxId || row.transaction_id || '#-',
    plan: row.plan || row.plans || '-',
    price: row.price || row.amount || '$0.00',
    date: row.date || row.created_at || '-',
  }))
}

export function normalizeSubscriptions(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || payload?.subscriptions || []
  return rows.map((row, index) => ({
    id: row.id || row.sid || `0${index + 1}`,
    name: row.name || row.userName || row.user_name || 'Unknown User',
    email: row.email || '-',
    status: row.status || '-',
    plan: row.plan || row.plans || '-',
    expirationDate: row.expirationDate || row.expiration_date || row.date || '-',
  }))
}

export function normalizeReports(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || payload?.reports || []
  return rows.map((row, index) => ({
    id: row.id || row.sid || `0${index + 1}`,
    name: row.name || row.reportFrom || row.report_from || 'Unknown User',
    email: row.email || '-',
    reason: row.reason || row.reportReason || row.report_reason || '-',
    reportedAt: row.reportedAt || row.date || row.created_at || '-',
  }))
}

export function normalizeProfile(payload = {}) {
  return {
    username: payload.username || payload.userName || payload.user_name || '-',
    email: payload.email || '-',
    contactNo: payload.contactNo || payload.contact_no || payload.phone || '-',
    name: payload.name || payload.fullName || 'Admin',
  }
}
