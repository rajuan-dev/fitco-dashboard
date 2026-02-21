export const endpoints = {
  auth: {
    login: '/auth/login',
    verifyOtp: '/auth/verify-otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  dashboard: '/dashboard',
  users: {
    list: '/users',
    blocked: '/users/blocked',
  },
  earnings: {
    summary: '/earnings',
    transactions: '/earnings/transactions',
  },
  subscriptions: {
    list: '/subscriptions',
  },
  reports: {
    list: '/reports',
    warn: '/reports/actions/warn',
    disable: '/reports/actions/disable',
    unblock: '/reports/actions/unblock',
  },
  profile: '/profile',
  settings: {
    privacy: '/settings/privacy-policy',
    about: '/settings/about-us',
    terms: '/settings/terms-condition',
  },
}

