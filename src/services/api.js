import {
  mockDashboard,
  mockReports,
  mockSubscriptionRows,
  mockTransactions,
  mockCms,
  mockUsers,
} from './mockData'
import { hasLiveApi, request, shouldUseFallbackOnError } from './apiClient'
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

const reportMockRows = mockUsers.map((user, i) => ({
  ...user,
  userId: user.id,
  reason: mockReports[i % mockReports.length],
  reportedAt: '02-24-2025',
}))

function centsToPrice(cents, currency = 'USD') {
  const amount = Number(cents || 0) / 100
  return `${currency.toUpperCase()} ${amount.toFixed(2)}`
}

function toCmsContent(listPayload, key, fallback = '') {
  const rows = Array.isArray(listPayload) ? listPayload : Array.isArray(listPayload?.data) ? listPayload.data : []
  const found = rows.find((item) => item?.key === key)
  return { content: found?.content || fallback }
}

async function withMock(path, fallbackData, options = {}) {
  if (!hasLiveApi()) {
    return fallbackData
  }

  try {
    return await request(path, options)
  } catch (error) {
    if (shouldUseFallbackOnError()) {
      return fallbackData
    }
    throw error
  }
}

async function loadDashboardData() {
  const [totals, userRatio] = await Promise.all([
    withMock(endpoints.dashboard.totals, mockDashboard),
    withMock(`${endpoints.dashboard.userRatio}?year=${new Date().getFullYear()}`, { monthly: [] }),
  ])

  return normalizeDashboard({
    ...totals,
    userRatio: userRatio?.monthly || [],
  })
}

async function loadRevenueSummary() {
  const [overview, transactionsPayload] = await Promise.all([
    withMock(endpoints.dashboard.overview, { totalRevenue: 0 }),
    withMock(`${endpoints.dashboard.transactions}?page=1&limit=200`, mockTransactions),
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
  const fallback = blocked ? mockUsers.filter((user) => user.isBlocked) : mockUsers.filter((user) => !user.isBlocked)
  const pageSize = 100
  let page = 1
  let allRows = []

  while (true) {
    const query = `${endpoints.users.list}?page=${page}&limit=${pageSize}&blocked=${String(blocked)}`
    const payload = await withMock(query, { data: fallback, pagination: { page: 1, pages: 1 } })
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
    const response = await withMock(endpoints.auth.login, { token: 'mock-token', user: { email } }, { method: 'POST', body: { email, password } })
    return {
      token: response?.accessToken || response?.token || null,
      user: response?.user,
    }
  },
  verifyOtp: async ({ email, otp }) => withMock(endpoints.auth.verifyOtp, { success: true }, { method: 'POST', body: { email, otp } }),
  requestPasswordReset: async ({ email }) => withMock(endpoints.auth.forgotPassword, { success: true }, { method: 'POST', body: { email } }),
  resetPassword: async ({ email, otp, newPassword }) =>
    withMock(endpoints.auth.resetPassword, { success: true }, { method: 'POST', body: { email, otp, newPassword } }),
  changePassword: async ({ currentPassword, newPassword }) =>
    withMock(endpoints.auth.changePassword, { success: true }, { method: 'PATCH', body: { currentPassword, newPassword } }),

  getDashboard: async () => loadDashboardData(),

  getUsers: async () => {
    return loadAllUsers({ blocked: false })
  },

  getBlockedUsers: async () => {
    return loadAllUsers({ blocked: true })
  },

  blockUser: async ({ userId }) => withMock(endpoints.users.block(userId), { success: true }, { method: 'PATCH' }),
  unblockAccount: async ({ userId }) => withMock(endpoints.users.unblock(userId), { success: true }, { method: 'PATCH' }),

  getEarnings: async () => loadRevenueSummary(),
  getTransactions: async () => normalizeTransactions(await withMock(`${endpoints.dashboard.transactions}?page=1&limit=300`, mockTransactions)),

  getSubscriptions: async () => normalizeSubscriptions(await withMock(`${endpoints.subscriptions.list}?page=1&limit=300`, mockSubscriptionRows)),

  getSubscriptionPricing: async () => {
    const payload = await withMock(endpoints.dashboard.subscriptionPricing, {
      monthlyPriceCents: 999,
      yearlyPriceCents: 9999,
      currency: 'usd',
    })

    return {
      monthlyFee: centsToPrice(payload?.monthlyPriceCents, payload?.currency),
      yearlyFee: centsToPrice(payload?.yearlyPriceCents, payload?.currency),
      currency: payload?.currency || 'usd',
      monthlyPriceCents: payload?.monthlyPriceCents || 0,
      yearlyPriceCents: payload?.yearlyPriceCents || 0,
    }
  },

  updateSubscriptionPricing: async ({ monthlyPriceCents, yearlyPriceCents, currency }) =>
    withMock(
      endpoints.dashboard.subscriptionPricing,
      {
        success: true,
        settings: {
          monthlyPriceCents,
          yearlyPriceCents,
          currency,
        },
      },
      {
        method: 'PATCH',
        body: { monthlyPriceCents, yearlyPriceCents, currency },
      },
    ),
  createCoupon: async ({ code, discountPercentage, expiryDate }) =>
    withMock(
      endpoints.coupons.create,
      { success: true, code, discountPercentage, expiryDate },
      {
        method: 'POST',
        body: { code, discountPercentage, expiryDate },
      },
    ),
  listCoupons: async () => withMock(endpoints.coupons.list, []),
  updateCoupon: async ({ couponId, discountPercentage, expiryDate }) =>
    withMock(
      endpoints.coupons.byId(couponId),
      { success: true, id: couponId, discountPercentage, expiryDate },
      {
        method: 'PUT',
        body: { discountPercentage, expiryDate },
      },
    ),
  deleteCoupon: async ({ couponId }) =>
    withMock(
      endpoints.coupons.byId(couponId),
      { success: true },
      {
        method: 'DELETE',
      },
    ),

  getReports: async () => normalizeReports(await withMock(endpoints.reports.list, reportMockRows)),

  getProfile: async () =>
    normalizeProfile(
      await withMock(endpoints.profile, { username: 'userdemo', email: 'email@gmail.com', contactNo: '+1 222 333 4444', name: 'Mr. Admin' }),
    ),

  updateProfile: async ({ name, username, email, contactNo }) =>
    withMock(endpoints.profile, { success: true }, { method: 'PATCH', body: { name, username, email, contactNo } }),

  getPrivacyPolicy: async () => toCmsContent(await withMock(endpoints.settings.list, []), 'privacy', mockCms.privacyPolicy),
  upsertPrivacyPolicy: async ({ content }) => withMock(endpoints.settings.privacy, { success: true, content }, { method: 'PATCH', body: { text: content } }),
  getAboutUs: async () => toCmsContent(await withMock(endpoints.settings.list, []), 'about', mockCms.aboutUs),
  upsertAboutUs: async ({ content }) => withMock(endpoints.settings.about, { success: true, content }, { method: 'PATCH', body: { text: content } }),
  getTermsAndConditions: async () => toCmsContent(await withMock(endpoints.settings.list, []), 'terms', mockCms.termsAndConditions),
  upsertTermsAndConditions: async ({ content }) => withMock(endpoints.settings.terms, { success: true, content }, { method: 'PATCH', body: { text: content } }),

  warnUser: async ({ userId, reportId, reason }) =>
    request(endpoints.reports.warn, { method: 'POST', body: { userId, reportId, reason } }),
  disableUser: async ({ userId, reportId, reason }) =>
    request(endpoints.reports.disable, { method: 'POST', body: { userId, reportId, reason } }),
  restoreUserAccess: async ({ userId, reportId }) =>
    request(endpoints.reports.unblock, { method: 'POST', body: { userId, reportId } }),
}
