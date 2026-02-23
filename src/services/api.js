import { request } from './apiClient'
import { endpoints } from './endpoints'
import {
  normalizeDashboard,
  normalizeEarnings,
  normalizeProfile,
  normalizeReports,
  normalizeSubscriptions,
  normalizeTransactions,
  normalizeUsers,
} from './mappers'

function centsToPrice(cents, currency = 'USD') {
  const amount = Number(cents || 0) / 100
  return `${currency.toUpperCase()} ${amount.toFixed(2)}`
}

function toCmsContent(listPayload, key, fallback = '') {
  const rows = Array.isArray(listPayload) ? listPayload : Array.isArray(listPayload?.data) ? listPayload.data : []
  const found = rows.find((item) => item?.key === key)
  return { content: found?.content || fallback }
}

async function loadDashboardData() {
  const [totals, userRatio] = await Promise.all([
    request(endpoints.dashboard.totals),
    request(`${endpoints.dashboard.userRatio}?year=${new Date().getFullYear()}`),
  ])

  return normalizeDashboard({
    ...totals,
    userRatio: userRatio?.monthly || [],
  })
}

async function loadRevenueSummary() {
  const [overview, transactionsPayload] = await Promise.all([
    request(endpoints.dashboard.overview),
    request(`${endpoints.dashboard.transactions}?page=1&limit=200`),
  ])

  const transactionRows = Array.isArray(transactionsPayload?.data) ? transactionsPayload.data : []
  const now = new Date()
  let today = 0
  let thisMonth = 0

  for (const transaction of transactionRows) {
    if (transaction?.status !== 'paid') continue
    const createdAt = new Date(transaction?.createdAt)
    if (Number.isNaN(createdAt.getTime())) continue

    if (createdAt.toDateString() === now.toDateString()) {
      today += Number(transaction?.amount || 0)
    }

    if (createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth()) {
      thisMonth += Number(transaction?.amount || 0)
    }
  }

  return normalizeEarnings({
    today,
    thisMonth,
    totalRevenue: overview?.totalRevenue || 0,
  })
}

async function loadAllUsers({ blocked }) {
  const pageSize = 100
  let page = 1
  let allRows = []

  while (true) {
    const query = `${endpoints.users.list}?page=${page}&limit=${pageSize}&blocked=${String(blocked)}`
    const payload = await request(query)
    const rows = normalizeUsers(payload)
    allRows = [...allRows, ...rows]

    const totalPages = Number(payload?.pagination?.pages || 1)
    if (page >= totalPages || rows.length === 0) break
    page += 1
  }

  return allRows
}

export const api = {
  login: async ({ email, password }) => {
    const response = await request(endpoints.auth.login, { method: 'POST', body: { email, password } })
    return {
      token: response?.accessToken || response?.token || null,
      user: response?.user,
    }
  },
  verifyOtp: async ({ email, otp }) => request(endpoints.auth.verifyOtp, { method: 'POST', body: { email, otp } }),
  requestPasswordReset: async ({ email }) => request(endpoints.auth.forgotPassword, { method: 'POST', body: { email } }),
  resetPassword: async ({ email, otp, newPassword }) =>
    request(endpoints.auth.resetPassword, { method: 'POST', body: { email, otp, newPassword } }),
  changePassword: async ({ currentPassword, newPassword }) =>
    request(endpoints.auth.changePassword, { method: 'PATCH', body: { currentPassword, newPassword } }),

  getDashboard: async () => loadDashboardData(),

  getUsers: async () => {
    return loadAllUsers({ blocked: false })
  },

  getBlockedUsers: async () => {
    return loadAllUsers({ blocked: true })
  },

  blockUser: async ({ userId }) => request(endpoints.users.block(userId), { method: 'PATCH' }),
  unblockAccount: async ({ userId }) => request(endpoints.users.unblock(userId), { method: 'PATCH' }),

  getEarnings: async () => loadRevenueSummary(),
  getTransactions: async () => normalizeTransactions(await request(`${endpoints.dashboard.transactions}?page=1&limit=300`)),

  getSubscriptions: async () => normalizeSubscriptions(await request(`${endpoints.subscriptions.list}?page=1&limit=300`)),
  updateSubscriptionStatus: async ({ subscriptionId, status }) => {
    const payload = await request(endpoints.subscriptions.updateStatus(subscriptionId), {
      method: 'PATCH',
      body: { status },
    })
    const [normalized] = normalizeSubscriptions([payload])
    return normalized || null
  },
  updateUserSubscriptionStatus: async ({ userId, status, planType }) => {
    const payload = await request(endpoints.subscriptions.updateUserStatus(userId), {
      method: 'PATCH',
      body: { status, planType },
    })
    const [normalized] = normalizeSubscriptions([payload])
    return normalized || null
  },

  getSubscriptionPricing: async () => {
    const payload = await request(endpoints.dashboard.subscriptionPricing)

    return {
      monthlyFee: centsToPrice(payload?.monthlyPriceCents, payload?.currency),
      yearlyFee: centsToPrice(payload?.yearlyPriceCents, payload?.currency),
      currency: payload?.currency || 'usd',
      monthlyPriceCents: payload?.monthlyPriceCents || 0,
      yearlyPriceCents: payload?.yearlyPriceCents || 0,
    }
  },

  updateSubscriptionPricing: async ({ monthlyPriceCents, yearlyPriceCents, currency }) =>
    request(endpoints.dashboard.subscriptionPricing, {
      method: 'PATCH',
      body: { monthlyPriceCents, yearlyPriceCents, currency },
    }),
  createCoupon: async ({ code, discountPercentage, expiryDate }) =>
    request(endpoints.coupons.create, {
      method: 'POST',
      body: { code, discountPercentage, expiryDate },
    }),
  listCoupons: async () => request(endpoints.coupons.list),
  updateCoupon: async ({ couponId, discountPercentage, expiryDate }) =>
    request(endpoints.coupons.byId(couponId), {
      method: 'PUT',
      body: { discountPercentage, expiryDate },
    }),
  deleteCoupon: async ({ couponId }) =>
    request(endpoints.coupons.byId(couponId), {
      method: 'DELETE',
    }),

  getReports: async () => normalizeReports(await request(endpoints.reports.list)),

  getProfile: async () =>
    normalizeProfile(await request(endpoints.profile)),

  updateProfile: async ({ name, username, email, contactNo }) =>
    request(endpoints.profile, { method: 'PATCH', body: { name, username, email, contactNo } }),

  getPrivacyPolicy: async () => toCmsContent(await request(endpoints.settings.list), 'privacy'),
  upsertPrivacyPolicy: async ({ content }) => request(endpoints.settings.privacy, { method: 'PATCH', body: { text: content } }),
  getAboutUs: async () => toCmsContent(await request(endpoints.settings.list), 'about'),
  upsertAboutUs: async ({ content }) => request(endpoints.settings.about, { method: 'PATCH', body: { text: content } }),
  getTermsAndConditions: async () => toCmsContent(await request(endpoints.settings.list), 'terms'),
  upsertTermsAndConditions: async ({ content }) => request(endpoints.settings.terms, { method: 'PATCH', body: { text: content } }),

  warnUser: async ({ userId, reportId, reason }) =>
    request(endpoints.reports.warn, { method: 'POST', body: { userId, reportId, reason } }),
  resolveReport: async ({ reportId }) =>
    request(endpoints.reports.resolve, { method: 'POST', body: { reportId } }),
  disableUser: async ({ userId, reportId, reason }) =>
    request(endpoints.reports.disable, { method: 'POST', body: { userId, reportId, reason } }),
  restoreUserAccess: async ({ userId, reportId }) =>
    request(endpoints.reports.unblock, { method: 'POST', body: { userId, reportId } }),
}
