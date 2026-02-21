import {
  mockDashboard,
  mockEarnings,
  mockReports,
  mockSubscriptionRows,
  mockTransactions,
  mockUsers,
} from './mockData'
import { getToken } from './auth'
import {
  normalizeDashboard,
  normalizeEarnings,
  normalizeProfile,
  normalizeReports,
  normalizeSubscriptions,
  normalizeTransactions,
  normalizeUsers,
} from './mappers'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, fallbackData, options = {}) {
  if (!API_BASE_URL) {
    return fallbackData
  }

  try {
    const token = getToken()
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch {
    return fallbackData
  }
}

export const api = {
  login: async ({ email, password }) => request('/auth/login', { token: 'mock-token', user: { email } }, { method: 'POST', body: { email, password } }),
  verifyOtp: async ({ email, otp }) => request('/auth/verify-otp', { token: 'mock-token', user: { email } }, { method: 'POST', body: { email, otp } }),
  requestPasswordReset: async ({ email }) => request('/auth/forgot-password', { success: true }, { method: 'POST', body: { email } }),
  resetPassword: async ({ email, password, confirmPassword }) =>
    request('/auth/reset-password', { success: true }, { method: 'POST', body: { email, password, confirmPassword } }),
  getDashboard: async () => normalizeDashboard(await request('/dashboard', mockDashboard)),
  getUsers: async () => normalizeUsers(await request('/users', mockUsers)),
  getBlockedUsers: async () => normalizeUsers(await request('/users/blocked', mockUsers)),
  getEarnings: async () => normalizeEarnings(await request('/earnings', mockEarnings)),
  getTransactions: async () => normalizeTransactions(await request('/earnings/transactions', mockTransactions)),
  getSubscriptions: async () => normalizeSubscriptions(await request('/subscriptions', mockSubscriptionRows)),
  getReports: async () =>
    normalizeReports(
      await request(
        '/reports',
        mockUsers.map((user, i) => ({ ...user, reason: mockReports[i % mockReports.length], reportedAt: '02-24-2025' })),
      ),
    ),
  getProfile: async () =>
    normalizeProfile(
      await request('/profile', { username: 'userdemo', email: 'email@gmail.com', contactNo: '+1 222 333 4444', name: 'Mr. Admin' }),
    ),
}
