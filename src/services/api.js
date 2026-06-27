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
import { REPORTING_CURRENCY, formatCurrencyDisplay } from '../utils/currency'

function centsToPrice(cents, currency = REPORTING_CURRENCY) {
  const amount = Number(cents || 0) / 100
  return formatCurrencyDisplay(amount, currency)
}

function toCmsContent(listPayload, key, fallback = '') {
  const rows = Array.isArray(listPayload) ? listPayload : Array.isArray(listPayload?.data) ? listPayload.data : []
  const found = rows.find((item) => item?.key === key)
  return { content: found?.content || fallback }
}

function normalizeCmsDocument(payload, fallbackTitle = '') {
  return {
    key: payload?.key || '',
    title: payload?.title || fallbackTitle,
    content: payload?.content || '',
    updatedAt: payload?.updatedAt || null,
  }
}

async function loadDashboardData({ year } = {}) {
  const selectedYear = Number(year) || new Date().getFullYear()
  const [totals, userRatio] = await Promise.all([
    request(endpoints.dashboard.totals),
    request(`${endpoints.dashboard.userRatio}?year=${selectedYear}`),
  ])

  return normalizeDashboard({
    ...totals,
    userRatio: userRatio?.monthly || [],
    selectedYear,
  })
}

async function loadRevenueSummary() {
  const [overview, transactionsPayload] = await Promise.all([
    request(endpoints.dashboard.overview),
    request(`${endpoints.dashboard.transactions}?page=1&limit=300`),
  ])

  const transactionRows = Array.isArray(transactionsPayload?.data) ? transactionsPayload.data : []
  const now = new Date()
  let fallbackToday = 0
  let fallbackThisMonth = 0

  for (const transaction of transactionRows) {
    if (transaction?.status !== 'paid') continue
    const createdAt = new Date(transaction?.createdAt)
    if (Number.isNaN(createdAt.getTime())) continue

    const reportingAmount = Number(transaction?.meta?.reportingAmount)
    if (!Number.isFinite(reportingAmount)) continue

    if (createdAt.toDateString() === now.toDateString()) {
      fallbackToday += reportingAmount
    }

    if (createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth()) {
      fallbackThisMonth += reportingAmount
    }
  }

  return normalizeEarnings({
    today: overview?.today ?? fallbackToday,
    thisMonth: overview?.thisMonth ?? fallbackThisMonth,
    totalRevenue: overview?.totalRevenue || 0,
    baseCurrency: overview?.baseCurrency || REPORTING_CURRENCY,
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

  getDashboard: async ({ year } = {}) => loadDashboardData({ year }),

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
      currency: payload?.currency || REPORTING_CURRENCY.toLowerCase(),
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
  updateCoupon: async ({ couponId, code, discountPercentage, expiryDate }) =>
    request(endpoints.coupons.byId(couponId), {
      method: 'PUT',
      body: { code, discountPercentage, expiryDate },
    }),
  deleteCoupon: async ({ couponId }) =>
    request(endpoints.coupons.byId(couponId), {
      method: 'DELETE',
    }),

  listFoodDatabase: async ({ page = 1, limit = 10, search = '' } = {}) =>
    request(`${endpoints.foodDatabase.list}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  createFoodItem: async (payload) =>
    request(endpoints.foodDatabase.create, {
      method: 'POST',
      body: payload,
    }),
  importFoodDatabaseCsv: async ({ csvContent }) =>
    request(`${endpoints.foodDatabase.create}/import-csv`, {
      method: 'POST',
      body: { csvContent },
    }),
  getFoodItem: async ({ foodId }) => request(endpoints.foodDatabase.byId(foodId)),
  updateFoodItem: async ({ foodId, ...payload }) =>
    request(endpoints.foodDatabase.byId(foodId), {
      method: 'PUT',
      body: payload,
    }),
  deleteFoodItem: async ({ foodId }) =>
    request(endpoints.foodDatabase.byId(foodId), {
      method: 'DELETE',
    }),
  lookupFoodByBarcode: async ({ barcode }) => request(endpoints.foodDatabase.byBarcode(barcode)),

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
  getPublicPrivacyPolicy: async () => normalizeCmsDocument(await request(endpoints.settings.publicByKey('privacy')), 'Privacy Policy'),
  getPublicAboutUs: async () => normalizeCmsDocument(await request(endpoints.settings.publicByKey('about')), 'About Us'),
  getPublicTermsAndConditions: async () => normalizeCmsDocument(await request(endpoints.settings.publicByKey('terms')), 'Terms & Conditions'),

  warnUser: async ({ userId, reportId, reason }) =>
    request(endpoints.reports.warn, { method: 'POST', body: { userId, reportId, reason } }),
  resolveReport: async ({ reportId }) =>
    request(endpoints.reports.resolve, { method: 'POST', body: { reportId } }),
  disableUser: async ({ userId, reportId, reason }) =>
    request(endpoints.reports.disable, { method: 'POST', body: { userId, reportId, reason } }),
  restoreUserAccess: async ({ userId, reportId }) =>
    request(endpoints.reports.unblock, { method: 'POST', body: { userId, reportId } }),
}
