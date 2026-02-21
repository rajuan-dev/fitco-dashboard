export const mockUsers = Array.from({ length: 10 }, (_, i) => ({
  id: `0${(i % 9) + 1}`,
  name: 'Robert Fox',
  email: i % 2 ? 'fox@email' : 'fox@email.com',
  phone: '+123124',
  joinedDate: '02-24-2024',
}))

export const mockReports = [
  'App not working',
  'Payment issue',
  'Chat problem',
  'Barcode scan issue',
  'Subscription issue',
  'Other',
]

export const mockDashboard = {
  totalUsers: '38.6K',
  totalRevenue: '4.9M',
  userRatio: [680, 380, 760, 550, 440, 810, 550, 620, 790, 720, 550, 760],
}

export const mockEarnings = {
  today: '1.2k',
  thisMonth: '18.6K',
  totalRevenue: '4.9M',
}

export const mockSubscriptionRows = mockUsers.map((user, index) => ({
  ...user,
  status: index < 3 ? 'Paid' : 'Expired',
  plan: index % 2 ? 'Monthly' : 'Yearly',
  expirationDate: '02-24-2024',
}))

export const mockTransactions = mockUsers.map((user, index) => ({
  ...user,
  trxId: '#123456',
  plan: index > 2 ? 'Yearly' : 'Monthly',
  price: index % 2 ? '$9.99' : '$19.99',
  date: '02-24-2024',
}))
