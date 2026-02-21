import {
  mockDashboard,
  mockEarnings,
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

export const api = {
  login: async ({ email, password }) => withMock(endpoints.auth.login, { token: 'mock-token', user: { email } }, { method: 'POST', body: { email, password } }),
  verifyOtp: async ({ email, otp }) => withMock(endpoints.auth.verifyOtp, { token: 'mock-token', user: { email } }, { method: 'POST', body: { email, otp } }),
  requestPasswordReset: async ({ email }) => withMock(endpoints.auth.forgotPassword, { success: true }, { method: 'POST', body: { email } }),
  resetPassword: async ({ email, password, confirmPassword }) =>
    withMock(endpoints.auth.resetPassword, { success: true }, { method: 'POST', body: { email, password, confirmPassword } }),
  getDashboard: async () => normalizeDashboard(await withMock(endpoints.dashboard, mockDashboard)),
  getUsers: async () => normalizeUsers(await withMock(endpoints.users.list, mockUsers)),
  getBlockedUsers: async () => normalizeUsers(await withMock(endpoints.users.blocked, mockUsers)),
  getEarnings: async () => normalizeEarnings(await withMock(endpoints.earnings.summary, mockEarnings)),
  getTransactions: async () => normalizeTransactions(await withMock(endpoints.earnings.transactions, mockTransactions)),
  getSubscriptions: async () => normalizeSubscriptions(await withMock(endpoints.subscriptions.list, mockSubscriptionRows)),
  getReports: async () => normalizeReports(await withMock(endpoints.reports.list, reportMockRows)),
  getProfile: async () =>
    normalizeProfile(
      await withMock(endpoints.profile, { username: 'userdemo', email: 'email@gmail.com', contactNo: '+1 222 333 4444', name: 'Mr. Admin' }),
    ),
  getPrivacyPolicy: async () => withMock(endpoints.settings.privacy, { content: mockCms.privacyPolicy }),
  upsertPrivacyPolicy: async ({ content }) => withMock(endpoints.settings.privacy, { success: true, content }, { method: 'POST', body: { content } }),
  getAboutUs: async () => withMock(endpoints.settings.about, { content: mockCms.aboutUs }),
  upsertAboutUs: async ({ content }) => withMock(endpoints.settings.about, { success: true, content }, { method: 'POST', body: { content } }),
  getTermsAndConditions: async () => withMock(endpoints.settings.terms, { content: mockCms.termsAndConditions }),
  upsertTermsAndConditions: async ({ content }) =>
    withMock(endpoints.settings.terms, { success: true, content }, { method: 'POST', body: { content } }),
  warnUser: async ({ userId, reportId, reason }) =>
    withMock(endpoints.reports.warn, { success: true }, { method: 'POST', body: { userId, reportId, reason } }),
  disableUser: async ({ userId, reportId, reason }) =>
    withMock(endpoints.reports.disable, { success: true }, { method: 'POST', body: { userId, reportId, reason } }),
  unblockUser: async ({ userId, reportId }) =>
    withMock(endpoints.reports.unblock, { success: true }, { method: 'POST', body: { userId, reportId } }),
}
