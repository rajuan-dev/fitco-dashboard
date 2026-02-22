export const endpoints = {
  auth: {
    login: '/api/v1/auth/admin/login',
    verifyOtp: '/api/v1/admin/verify-reset-otp',
    forgotPassword: '/api/v1/admin/forgot-password',
    resetPassword: '/api/v1/admin/reset-password',
    changePassword: '/api/v1/admin/password',
  },
  dashboard: {
    overview: '/api/v1/dashboard/overview',
    totals: '/api/v1/dashboard/totals',
    userRatio: '/api/v1/dashboard/user-ratio',
    transactions: '/api/v1/dashboard/transactions',
    revenue: '/api/v1/dashboard/revenue',
    subscriptionPricing: '/api/v1/dashboard/subscription-pricing',
  },
  users: {
    list: '/api/v1/users',
    byId: (userId) => `/api/v1/users/${userId}`,
    block: (userId) => `/api/v1/users/${userId}/block`,
    unblock: (userId) => `/api/v1/users/${userId}/unblock`,
  },
  subscriptions: {
    list: '/api/v1/subscriptions',
  },
  coupons: {
    list: '/api/v1/coupons',
    create: '/api/v1/coupons',
    byId: (couponId) => `/api/v1/coupons/${couponId}`,
  },
  reports: {
    list: '/api/v1/reports',
    warn: '/api/v1/reports/actions/warn',
    resolve: '/api/v1/reports/actions/resolve',
    disable: '/api/v1/reports/actions/disable',
    unblock: '/api/v1/reports/actions/unblock',
  },
  profile: '/api/v1/admin/profile',
  settings: {
    list: '/api/v1/cms',
    privacy: '/api/v1/cms/privacy-policy',
    about: '/api/v1/cms/about-us',
    terms: '/api/v1/cms/terms-conditions',
  },
}
