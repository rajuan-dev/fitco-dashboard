import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JoditEditor from 'jodit-react'
import 'jodit/es2021/jodit.min.css'
import { AdminLayout } from './components/AdminLayout'
import { Field, InfoRow, Logo, ModalCard, PageLoader } from './components/UI'
import { defaultRoute, routes } from './config/routes'
import DashboardPage from './features/admin/dashboard/DashboardPage'
import EarningsPage from './features/admin/earnings/EarningsPage'
import FoodDatabasePage from './features/admin/foodDatabase/FoodDatabasePage'
import ReportsPage from './features/admin/reports/ReportsPage'
import SettingsPage from './features/admin/settings/SettingsPage'
import SubscriptionsPage from './features/admin/subscriptions/SubscriptionsPage'
import UsersPage from './features/admin/users/UsersPage'
import { PublicCmsContentPage, PublicCmsHub, PublicLandingPage } from './features/public/PublicCmsPages'
import { useAsyncData } from './hooks/useAsyncData'
import { navigate, useRouter } from './hooks/useRouter'
import { api } from './services/api'
import { clearToken, isAuthenticated, setToken } from './services/auth'
import { REPORTING_CURRENCY } from './utils/currency'

const isAuthRoute = (path) => path.startsWith('/auth')
const isAdminRoute = (path) => path.startsWith('/admin')
const publicRouteMap = {
  [routes.publicPrivacy]: { key: 'privacy', title: 'Privacy Policy', description: 'Privacy disclosures and data handling information for Fitco.' },
  [routes.publicAbout]: { key: 'about', title: 'About Us', description: 'Public company and product information about Fitco.' },
  [routes.publicTerms]: { key: 'terms', title: 'Terms & Conditions', description: 'Terms that govern use of the Fitco app and services.' },
  [routes.publicTermsLegacy]: { key: 'terms', title: 'Terms & Conditions', description: 'Terms that govern use of the Fitco app and services.' },
}
const publicHubItems = [
  { path: routes.publicAbout, title: 'About Us', description: 'Company information and what Fitco provides.' },
  { path: routes.publicPrivacy, title: 'Privacy Policy', description: 'How user data is collected, used, and protected.' },
  { path: routes.publicTerms, title: 'Terms & Conditions', description: 'Usage terms for the mobile app and related services.' },
]
const isPublicRoute = (path) => path === '/' || path === routes.publicInfo || Boolean(publicRouteMap[path])
const PAGE_SIZE = 8
const getErrorMessage = (error, fallback) => error?.payload?.message || error?.message || fallback
const isSameCalendarDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()
const getAdminDisplayName = (profile = {}) => {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (profile.name) return String(profile.name).trim()
  if (profile.username && profile.username !== '-') return String(profile.username).trim()
  return 'Admin'
}
const getAdminInitials = (profile = {}) => {
  const firstName = String(profile.firstName || '').trim()
  const lastName = String(profile.lastName || '').trim()
  if (firstName && lastName) {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  const text = getAdminDisplayName(profile)
  const words = String(text)
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean)
  if (words.length >= 2) {
    return `${words[0][0] || ''}${words[words.length - 1][0] || ''}`.toUpperCase()
  }
  return String(words[0] || 'A')
    .slice(0, 2)
    .toUpperCase()
}

const toDateTimeLocalValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function App() {
  const { path } = useRouter()
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2600)
  }, [])

  useEffect(() => {
    if (path === '/') {
      navigate(routes.login)
      return
    }

    if (path === routes.publicTermsLegacy) {
      navigate(routes.publicTerms)
      return
    }

    if (isAdminRoute(path) && !authenticated) {
      navigate(routes.login)
      return
    }

    if (isAuthRoute(path) && authenticated) {
      navigate(routes.dashboard)
    }
  }, [authenticated, path])

  return (
    <main className={`${isPublicRoute(path) ? 'min-h-screen bg-[#eef5ef]' : 'app-bg min-h-screen'} ${isAdminRoute(path) || isPublicRoute(path) ? 'p-0 md:p-0' : 'p-3 md:p-5'}`}>
      {isAuthRoute(path) ? <AuthRoutes onAuthSuccess={() => setAuthenticated(true)} /> : null}
      {isAdminRoute(path) ? <AdminRoutes path={path} onLogout={() => setAuthenticated(false)} pushToast={pushToast} /> : null}
      {isPublicRoute(path) ? <PublicRoutes path={path} /> : null}
      {!isAuthRoute(path) && !isAdminRoute(path) && !isPublicRoute(path) && path !== '/' ? <UnknownRoute /> : null}
      <ToastStack toasts={toasts} />
    </main>
  )
}

function PublicRoutes({ path }) {
  const routeConfig = publicRouteMap[path]
  const [publicPages, setPublicPages] = useState({})
  const [publicLoadingKey, setPublicLoadingKey] = useState('')
  const [publicError, setPublicError] = useState(null)
  const copyPublicLink = useCallback(async (targetPath) => {
    const href = `${window.location.origin}${targetPath}`
    try {
      await navigator.clipboard.writeText(href)
    } catch {
      window.prompt('Copy this public URL', href)
    }
  }, [])

  useEffect(() => {
    const suffix = 'Fitco'
    if (path === routes.publicInfo) {
      document.title = `Public Pages | ${suffix}`
      return
    }

    const currentTitle = routeConfig?.title || 'Public Page'
    document.title = `${currentTitle} | ${suffix}`
  }, [path, routeConfig])

  useEffect(() => {
    if (!routeConfig?.key) return
    if (publicPages[routeConfig.key]) {
      setPublicError(null)
      return
    }

    let active = true
    setPublicLoadingKey(routeConfig.key)
    setPublicError(null)

    const loadPublicPage = async () => {
      try {
        let payload = null
        if (routeConfig.key === 'privacy') payload = await api.getPublicPrivacyPolicy()
        else if (routeConfig.key === 'about') payload = await api.getPublicAboutUs()
        else payload = await api.getPublicTermsAndConditions()

        if (!active) return
        setPublicPages((prev) => ({ ...prev, [routeConfig.key]: payload }))
      } catch (error) {
        if (!active) return
        setPublicError(error)
      } finally {
        if (active) {
          setPublicLoadingKey('')
        }
      }
    }

    loadPublicPage()

    return () => {
      active = false
    }
  }, [publicPages, routeConfig])

  if (path === '/') {
    return <PublicLandingPage />
  }

  if (path === routes.publicInfo) {
    return <PublicCmsHub items={publicHubItems} onCopyLink={copyPublicLink} />
  }

  const currentPage = routeConfig?.key ? publicPages[routeConfig.key] || null : null
  const loading = Boolean(routeConfig?.key) && !currentPage && publicLoadingKey === routeConfig.key

  return (
    <PublicCmsContentPage
      page={currentPage}
      loading={loading}
      error={publicError}
      currentPath={path}
      onCopyLink={copyPublicLink}
      relatedLinks={publicHubItems.map((item) => ({
        ...item,
        active: item.path === path,
      }))}
    />
  )
}

function AuthRoutes({ onAuthSuccess }) {
  const { path } = useRouter()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(
    () =>
      ({
        [routes.login]: 'Sign in',
        [routes.otp]: 'Verify OTP',
        [routes.forgot]: 'Forget Password',
        [routes.reset]: 'Set new password',
      })[path] || 'Sign in',
    [path],
  )

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const response = await api.login({ email, password })
      if (response?.token) {
        setToken(response.token)
        onAuthSuccess()
        navigate(routes.dashboard)
      } else {
        setError('Unable to sign in. Please try again.')
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to sign in. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [email, onAuthSuccess, password])

  const handleLoginSubmit = useCallback(
    (event) => {
      event.preventDefault()
      handleLogin()
    },
    [handleLogin],
  )

  const handleOtpVerify = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const response = await api.verifyOtp({ email, otp })
      if (response?.success || response?.message) {
        navigate(routes.reset)
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Invalid OTP. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [email, otp])

  const handleForgot = useCallback(async () => {
    if (!email) {
      setError('Email is required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.requestPasswordReset({ email })
      navigate(routes.otp)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to send reset code. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [email])

  const handleResetPassword = useCallback(async () => {
    if (!otp || !password || !confirmPassword) {
      setError('OTP and password fields are required.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.resetPassword({ email, otp, newPassword: password })
      navigate(routes.login)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to reset password. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [confirmPassword, email, otp, password])

  return (
    <section className="mx-auto flex min-h-[92vh] max-w-3xl items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--fitco-border)] bg-white px-5 py-8 shadow-xl md:px-14 md:py-10">
        <Logo className="mb-8 text-center" />
        <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-[#1f2b3a] md:text-[42px]">{title}</h1>

        {path === routes.login ? (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34475a] md:text-base">Password</span>
              <div className="relative">
                <input
                  className="field pr-12"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8da0ad]"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                >
                  {showLoginPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-[#495a61]">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--fitco-green)]" />
                Remember password
              </label>
              <button type="button" className="text-[#77a67a] underline" onClick={() => navigate(routes.forgot)}>
                Forgot password?
              </button>
            </div>
            <button type="submit" className="btn-primary mt-1" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : null}

        {path === routes.otp ? (
          <div className="space-y-5">
            <p className="text-[#495a61]">Please check your email. We have sent a code to {email}</p>
            <Field label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <div className="flex justify-between text-sm text-[#637681]">
              <span>Didn't receive code?</span>
              <button className="text-[#77a67a] underline" onClick={handleForgot} disabled={submitting}>
                Resend
              </button>
            </div>
            <button className="btn-primary" onClick={handleOtpVerify} disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        ) : null}

        {path === routes.forgot ? (
          <div className="space-y-4">
            <p className="text-[#495a61]">Enter your email address to get a verification code for resetting your password.</p>
            <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primary" onClick={handleForgot} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        ) : null}

        {path === routes.reset ? (
          <div className="space-y-4">
            <Field label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Field label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button className="btn-primary" onClick={handleResetPassword} disabled={submitting}>
              {submitting ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm font-medium text-[#e35555]">{error}</p> : null}
      </div>
    </section>
  )
}

function AdminRoutes({ path, onLogout, pushToast }) {
  const [dashboardYear, setDashboardYear] = useState(String(new Date().getFullYear()))
  const loadDashboard = useCallback(() => api.getDashboard({ year: dashboardYear }), [dashboardYear])
  const loadUsers = useCallback(() => api.getUsers(), [])
  const loadBlockedUsers = useCallback(() => api.getBlockedUsers(), [])
  const loadEarnings = useCallback(() => api.getEarnings(), [])
  const loadTransactions = useCallback(() => api.getTransactions(), [])
  const loadSubscriptions = useCallback(() => api.getSubscriptions(), [])
  const loadReports = useCallback(() => api.getReports(), [])
  const loadProfile = useCallback(() => api.getProfile(), [])
  const loadSubscriptionPricing = useCallback(() => api.getSubscriptionPricing(), [])
  const loadPrivacyPolicy = useCallback(() => api.getPrivacyPolicy(), [])
  const loadAboutUs = useCallback(() => api.getAboutUs(), [])
  const loadTerms = useCallback(() => api.getTermsAndConditions(), [])

  const { data: dashboardData, loading: dashboardLoading } = useAsyncData(loadDashboard, {})
  const { data: users, loading: usersLoading } = useAsyncData(loadUsers, [])
  const { data: blockedUsers, loading: blockedUsersLoading } = useAsyncData(loadBlockedUsers, [])
  const { data: earningsData, loading: earningsLoading } = useAsyncData(loadEarnings, {})
  const { data: transactions, loading: transactionsLoading } = useAsyncData(loadTransactions, [])
  const { data: subscriptions, loading: subscriptionsLoading } = useAsyncData(loadSubscriptions, [])
  const { data: subscriptionPricing } = useAsyncData(loadSubscriptionPricing, null)
  const { data: reports, loading: reportsLoading } = useAsyncData(loadReports, [])
  const { data: profile, loading: profileLoading } = useAsyncData(loadProfile, {})
  const { data: privacyPayload, loading: privacyLoading } = useAsyncData(loadPrivacyPolicy, { content: '' })
  const { data: aboutPayload, loading: aboutLoading } = useAsyncData(loadAboutUs, { content: '' })
  const { data: termsPayload, loading: termsLoading } = useAsyncData(loadTerms, { content: '' })

  const [privacyText, setPrivacyText] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [termsText, setTermsText] = useState('')
  const [savingCms, setSavingCms] = useState(false)
  const [profileDraft, setProfileDraft] = useState({ username: '', firstName: '', lastName: '', email: '', contactNo: '', name: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [subscriptionConfig, setSubscriptionConfig] = useState({
    monthlyFee: '9.99',
    yearlyFee: '99.99',
    couponCode: 'PREMIUM50',
    discountPercent: 10,
    couponExpiry: '',
  })
  const [usersPage, setUsersPage] = useState(1)
  const [blockedUsersPage, setBlockedUsersPage] = useState(1)
  const [earningsPage, setEarningsPage] = useState(1)
  const [subscriptionsPage, setSubscriptionsPage] = useState(1)
  const [reportsPage, setReportsPage] = useState(1)
  const [reportsState, setReportsState] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [blockedUsersState, setBlockedUsersState] = useState([])
  const [subscriptionsState, setSubscriptionsState] = useState([])
  const [subscriptionSearch, setSubscriptionSearch] = useState('')
  const [pendingUserAction, setPendingUserAction] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserBlocked, setSelectedUserBlocked] = useState(false)
  const [selectedUserSource, setSelectedUserSource] = useState(routes.users)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const userSummary = useMemo(() => {
    const combined = [...activeUsers, ...blockedUsersState]
    const seen = new Set()
    const uniqueUsers = combined.filter((user) => {
      const key = String(user?.id || '')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })

    const now = new Date()
    let newUsersToday = 0
    let newUsersThisMonth = 0

    uniqueUsers.forEach((user) => {
      const createdAt = user?.createdAt ? new Date(user.createdAt) : null
      if (!createdAt || Number.isNaN(createdAt.getTime())) return

      if (isSameCalendarDay(createdAt, now)) {
        newUsersToday += 1
      }

      if (createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth()) {
        newUsersThisMonth += 1
      }
    })

    return {
      newUsersToday,
      newUsersThisMonth,
      totalUsers: uniqueUsers.length,
    }
  }, [activeUsers, blockedUsersState])

  useEffect(() => {
    if (privacyPayload?.content !== undefined) setPrivacyText(privacyPayload.content)
  }, [privacyPayload])

  useEffect(() => {
    if (aboutPayload?.content !== undefined) setAboutText(aboutPayload.content)
  }, [aboutPayload])

  useEffect(() => {
    if (termsPayload?.content !== undefined) setTermsText(termsPayload.content)
  }, [termsPayload])

  useEffect(() => {
    if (profile && (profile.username || profile.email || profile.contactNo || profile.name)) {
      setProfileDraft(profile)
    }
  }, [profile])

  useEffect(() => {
    if (subscriptionPricing?.monthlyFee && subscriptionPricing?.yearlyFee) {
      setSubscriptionConfig((prev) => ({
        ...prev,
        monthlyFee: String(subscriptionPricing.monthlyFee).replace(/^[A-Z]{3}\s/, ''),
        yearlyFee: String(subscriptionPricing.yearlyFee).replace(/^[A-Z]{3}\s/, ''),
      }))
    }
  }, [subscriptionPricing])

  useEffect(() => {
    if (!usersLoading) {
      setActiveUsers(users)
    }
  }, [users, usersLoading])

  useEffect(() => {
    if (!blockedUsersLoading) {
      setBlockedUsersState(blockedUsers)
    }
  }, [blockedUsers, blockedUsersLoading])

  useEffect(() => {
    if (!reportsLoading) {
      setReportsState(reports)
    }
  }, [reports, reportsLoading])

  useEffect(() => {
    if (!subscriptionsLoading) {
      setSubscriptionsState(subscriptions)
    }
  }, [subscriptions, subscriptionsLoading])

  const filteredSubscriptions = useMemo(() => {
    const query = subscriptionSearch.trim().toLowerCase()
    if (!query) return subscriptionsState
    return subscriptionsState.filter((item) =>
      [String(item.email || ''), String(item.name || '')].some((value) => value.toLowerCase().includes(query)),
    )
  }, [subscriptionsState, subscriptionSearch])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(activeUsers.length / PAGE_SIZE))
    if (usersPage > maxPage) setUsersPage(maxPage)
  }, [activeUsers.length, usersPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(blockedUsersState.length / PAGE_SIZE))
    if (blockedUsersPage > maxPage) setBlockedUsersPage(maxPage)
  }, [blockedUsersPage, blockedUsersState.length])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredSubscriptions.length / PAGE_SIZE))
    if (subscriptionsPage > maxPage) setSubscriptionsPage(maxPage)
  }, [filteredSubscriptions.length, subscriptionsPage])

  useEffect(() => {
    setSubscriptionsPage(1)
  }, [subscriptionSearch])

  const handleLogout = useCallback(() => {
    clearToken()
    onLogout()
    navigate(routes.login)
  }, [onLogout])

  const savePrivacy = useCallback(async () => {
    setSavingCms(true)
    try {
      await api.upsertPrivacyPolicy({ content: privacyText })
      pushToast('Privacy Policy saved successfully.')
    } catch {
      pushToast('Failed to save Privacy Policy.', 'error')
    } finally {
      setSavingCms(false)
    }
  }, [privacyText, pushToast])

  const saveAbout = useCallback(async () => {
    setSavingCms(true)
    try {
      await api.upsertAboutUs({ content: aboutText })
      pushToast('About Us saved successfully.')
    } catch {
      pushToast('Failed to save About Us.', 'error')
    } finally {
      setSavingCms(false)
    }
  }, [aboutText, pushToast])

  const saveTerms = useCallback(async () => {
    setSavingCms(true)
    try {
      await api.upsertTermsAndConditions({ content: termsText })
      pushToast('Terms & Conditions saved successfully.')
    } catch {
      pushToast('Failed to save Terms & Conditions.', 'error')
    } finally {
      setSavingCms(false)
    }
  }, [termsText, pushToast])

  const updateSubscriptionConfig = useCallback((payload) => {
    setSubscriptionConfig((prev) => ({ ...prev, ...payload }))
  }, [])

  const paginate = useCallback((rows, page) => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [])

  const openBlockConfirm = useCallback((user, action, source = routes.users) => {
    if (!user) return
    setPendingUserAction({ user, action, source })
    navigate(routes.blockConfirm)
  }, [])

  const openUserDetails = useCallback((user, blocked = false, source = routes.users) => {
    if (!user) return
    setSelectedUser(user)
    setSelectedUserBlocked(Boolean(blocked))
    setSelectedUserSource(source)
    navigate(routes.userDetails)
  }, [])

  const openTransactionDetails = useCallback((transaction) => {
    if (!transaction) return
    setSelectedTransaction(transaction)
    navigate(routes.transaction)
  }, [])

  const handleSubscriptionSearchChange = useCallback((value) => {
    setSubscriptionSearch(value)
  }, [])

  const handleConfirmUserAction = useCallback(async () => {
    if (!pendingUserAction?.user || !pendingUserAction?.action) {
      navigate(routes.users)
      return
    }

    const { user, action, source } = pendingUserAction
    if (action === 'block') {
      try {
        await api.blockUser({ userId: user.id })
        setActiveUsers((prev) => prev.filter((item) => item !== user))
        setBlockedUsersState((prev) => [user, ...prev.filter((item) => item !== user)])
        pushToast(`${user.name} blocked successfully.`)
        navigate(source === routes.dashboard ? routes.dashboard : routes.blockedUsers)
      } catch (error) {
        pushToast(getErrorMessage(error, `Failed to block ${user.name}.`), 'error')
      }
    } else {
      try {
        await api.unblockAccount({ userId: user.id })
        setBlockedUsersState((prev) => prev.filter((item) => item !== user))
        setActiveUsers((prev) => [user, ...prev.filter((item) => item !== user)])
        pushToast(`${user.name} unblocked successfully.`)
        navigate(source === routes.dashboard ? routes.dashboard : routes.users)
      } catch (error) {
        pushToast(getErrorMessage(error, `Failed to unblock ${user.name}.`), 'error')
      }
    }
    setPendingUserAction(null)
  }, [pendingUserAction, pushToast])

  const saveProfile = useCallback(async () => {
    setSavingProfile(true)
    try {
      const updatedName = (profileDraft.username || profileDraft.name || '').trim()
      await api.updateProfile({
        name: updatedName,
        username: updatedName,
        email: profileDraft.email,
        contactNo: profileDraft.contactNo,
      })
      setProfileDraft((prev) => ({ ...prev, name: updatedName, username: updatedName || prev.username }))
      pushToast('Profile updated successfully.')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Failed to update profile.'), 'error')
    } finally {
      setSavingProfile(false)
    }
  }, [profileDraft.contactNo, profileDraft.email, profileDraft.name, profileDraft.username, pushToast])

  const handleCancelUserAction = useCallback(() => {
    const fallback = pendingUserAction?.source || (pendingUserAction?.action === 'unblock' ? routes.blockedUsers : routes.users)
    setPendingUserAction(null)
    navigate(fallback)
  }, [pendingUserAction])

  const findUserByReport = useCallback(
    (reportUser) =>
      activeUsers.find((u) => String(u.id) === String(reportUser.userId)) ||
      blockedUsersState.find((u) => String(u.id) === String(reportUser.userId)) ||
      activeUsers.find((u) => u.email === reportUser.email) ||
      activeUsers.find((u) => u.name === reportUser.name) ||
      blockedUsersState.find((u) => u.email === reportUser.email) ||
      blockedUsersState.find((u) => u.name === reportUser.name),
    [activeUsers, blockedUsersState],
  )

  const isReportUserBlocked = useCallback(
    (reportUser) =>
      blockedUsersState.some(
        (u) =>
          (reportUser.userId && String(u.id) === String(reportUser.userId)) ||
          (reportUser.email && u.email === reportUser.email) ||
          (reportUser.name && u.name === reportUser.name),
      ),
    [blockedUsersState],
  )

  const handleReportAction = useCallback(
    async (action, reportUser) => {
      const targetUser = findUserByReport(reportUser)
      const userId = targetUser?.id || reportUser.userId || null

      if (action === 'warn') {
        try {
          await api.warnUser({ userId, reportId: reportUser.id, reason: reportUser.reason })
          setReportsState((prev) => prev.map((report) => (String(report.id) === String(reportUser.id) ? { ...report, status: 'in_progress' } : report)))
          pushToast(`Warning sent to ${reportUser.name}.`)
        } catch (error) {
          pushToast(getErrorMessage(error, `Failed to warn ${reportUser.name}.`), 'error')
        }
        return
      }

      if (action === 'resolve') {
        try {
          await api.resolveReport({ reportId: reportUser.id })
          setReportsState((prev) => prev.map((report) => (String(report.id) === String(reportUser.id) ? { ...report, status: 'resolved' } : report)))
          pushToast(`Report resolved for ${reportUser.name}.`)
        } catch (error) {
          pushToast(getErrorMessage(error, `Failed to resolve report for ${reportUser.name}.`), 'error')
        }
        return
      }

      if (action === 'disable') {
        if (!targetUser) {
          pushToast(`Account not found for ${reportUser.name}.`, 'error')
          return
        }
        try {
          await api.disableUser({ userId, reportId: reportUser.id, reason: reportUser.reason })
          setActiveUsers((prev) => prev.filter((u) => u !== targetUser))
          setBlockedUsersState((prev) => [targetUser, ...prev.filter((u) => u !== targetUser)])
          setReportsState((prev) => prev.map((report) => (String(report.id) === String(reportUser.id) ? { ...report, status: 'in_progress' } : report)))
          pushToast(`${reportUser.name} account disabled.`)
        } catch (error) {
          pushToast(getErrorMessage(error, `Failed to disable ${reportUser.name}.`), 'error')
        }
        return
      }

      if (action === 'toggle_block') {
        if (!targetUser) {
          pushToast(`Account not found for ${reportUser.name}.`, 'error')
          return
        }

        const isBlocked = blockedUsersState.some((u) => String(u.id) === String(targetUser.id))

        try {
          if (isBlocked) {
            await api.restoreUserAccess({ userId, reportId: reportUser.id })
            setBlockedUsersState((prev) => prev.filter((u) => u !== targetUser))
            setActiveUsers((prev) => [targetUser, ...prev.filter((u) => u !== targetUser)])
            setReportsState((prev) => prev.map((report) => (String(report.id) === String(reportUser.id) ? { ...report, status: 'in_progress' } : report)))
            pushToast(`${reportUser.name} account enabled.`)
            return
          }

          await api.disableUser({ userId, reportId: reportUser.id, reason: reportUser.reason })
          setActiveUsers((prev) => prev.filter((u) => u !== targetUser))
          setBlockedUsersState((prev) => [targetUser, ...prev.filter((u) => u !== targetUser)])
          setReportsState((prev) => prev.map((report) => (String(report.id) === String(reportUser.id) ? { ...report, status: 'in_progress' } : report)))
          pushToast(`${reportUser.name} account disabled.`)
        } catch (error) {
          pushToast(getErrorMessage(error, `Failed to update access for ${reportUser.name}.`), 'error')
        }
        return
      }

      if (!targetUser) {
        pushToast(`Account not found for ${reportUser.name}.`, 'error')
        return
      }
      try {
        await api.restoreUserAccess({ userId, reportId: reportUser.id })
        setBlockedUsersState((prev) => prev.filter((u) => u !== targetUser))
        setActiveUsers((prev) => [targetUser, ...prev.filter((u) => u !== targetUser)])
        setReportsState((prev) => prev.map((report) => (String(report.id) === String(reportUser.id) ? { ...report, status: 'in_progress' } : report)))
        pushToast(`${reportUser.name} account restored.`)
      } catch (error) {
        pushToast(getErrorMessage(error, `Failed to restore ${reportUser.name}.`), 'error')
      }
    },
    [blockedUsersState, findUserByReport, pushToast],
  )

  const basePath = useMemo(() => {
    if (path === routes.userDetails) {
      return selectedUserSource
    }
    if (path === routes.blockConfirm) {
      return pendingUserAction?.source || (pendingUserAction?.action === 'unblock' ? routes.blockedUsers : routes.users)
    }
    if (path === routes.transaction) {
      return routes.earnings
    }
    if (path === routes.manageFees) {
      return routes.subscriptions
    }
    if (path === routes.logoutConfirm) {
      return routes.dashboard
    }
    return path
  }, [path, pendingUserAction?.action, pendingUserAction?.source, selectedUserSource])

  const page = (
    <>
      {basePath === routes.dashboard &&
        (dashboardLoading ? (
          <PageLoader />
        ) : (
          <DashboardPage
            data={dashboardData}
            totalRevenue={earningsData?.totalRevenue}
            users={activeUsers}
            selectedYear={dashboardYear}
            onYearChange={setDashboardYear}
            onViewUser={(user) => openUserDetails(user, false, routes.dashboard)}
            onBlockUser={(user) => openBlockConfirm(user, 'block', routes.dashboard)}
          />
        ))}

      {basePath === routes.foodDatabase && <FoodDatabasePage />}

      {basePath === routes.users &&
        (
          <UsersPage
            loading={usersLoading}
            rows={paginate(activeUsers, usersPage)}
            page={usersPage}
            pageSize={PAGE_SIZE}
            totalItems={activeUsers.length}
            summary={userSummary}
            toggleButtonText="Blocked Users"
            onTogglePage={() => navigate(routes.blockedUsers)}
            onViewUser={(user) => openUserDetails(user, false, routes.users)}
            onToggleBlock={(user) => openBlockConfirm(user, 'block', routes.users)}
            onPageChange={setUsersPage}
          />
        )}

      {basePath === routes.blockedUsers &&
        (
          <UsersPage
            loading={blockedUsersLoading}
            rows={paginate(blockedUsersState, blockedUsersPage)}
            page={blockedUsersPage}
            pageSize={PAGE_SIZE}
            totalItems={blockedUsersState.length}
            summary={userSummary}
            blocked
            toggleButtonText="Active Users"
            onTogglePage={() => navigate(routes.users)}
            onViewUser={(user) => openUserDetails(user, true, routes.blockedUsers)}
            onToggleBlock={(user) => openBlockConfirm(user, 'unblock', routes.blockedUsers)}
            onPageChange={setBlockedUsersPage}
          />
        )}

      {basePath === routes.earnings &&
        (
          <EarningsPage
            loading={earningsLoading || transactionsLoading}
            earningsData={earningsData}
            transactions={paginate(transactions, earningsPage)}
            page={earningsPage}
            pageSize={PAGE_SIZE}
            totalItems={transactions.length}
            onPageChange={setEarningsPage}
            onViewTransaction={openTransactionDetails}
          />
        )}

      {basePath === routes.subscriptions &&
        (
          <SubscriptionsPage
            loading={subscriptionsLoading}
            subscriptions={paginate(filteredSubscriptions, subscriptionsPage)}
            page={subscriptionsPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredSubscriptions.length}
            onPageChange={setSubscriptionsPage}
            searchQuery={subscriptionSearch}
            onSearchChange={handleSubscriptionSearchChange}
          />
        )}

      {basePath === routes.reports &&
        (
          <ReportsPage
            loading={reportsLoading}
            reports={paginate(
              reportsState.map((report) => ({
                ...report,
                isBlocked: isReportUserBlocked(report),
              })),
              reportsPage,
            )}
            page={reportsPage}
            pageSize={PAGE_SIZE}
            totalItems={reportsState.length}
            onPageChange={setReportsPage}
            onReportAction={handleReportAction}
          />
        )}

      {basePath === routes.profile &&
        (profileLoading ? (
          <PageLoader />
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--fitco-border)] bg-white p-4 md:p-6">
            <div className="grid place-items-center">
              <div className="avatar">{getAdminInitials(profileDraft)}</div>
              <h3 className="mt-3 text-3xl font-bold text-[#2a3946] md:text-[42px]">{getAdminDisplayName(profileDraft)}</h3>
              <div className="mt-2 flex gap-6 text-sm md:text-base">
                <button className="font-semibold text-[var(--fitco-green)] underline">Edit Profile</button>
                <button className="text-[#7a8c90]" onClick={() => navigate(routes.changePassword)}>
                  Change Password
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Field
                label="User Name"
                value={profileDraft.username || ''}
                onChange={(event) => {
                  const nextName = event.target.value
                  setProfileDraft((prev) => ({ ...prev, username: nextName, name: nextName }))
                }}
              />
              <Field label="Email" value={profileDraft.email || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))} />
              <Field label="Contact No" value={profileDraft.contactNo || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, contactNo: event.target.value }))} />
              <button className="btn-primary" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        ))}

      {basePath === routes.settings && (
        <SettingsPage
          onNavigate={(key) => {
            if (key === 'profile') navigate(routes.profile)
            if (key === 'change-password') navigate(routes.changePassword)
            if (key === 'privacy') navigate(routes.privacy)
            if (key === 'terms') navigate(routes.terms)
            if (key === 'about') navigate(routes.about)
          }}
        />
      )}

      {basePath === routes.changePassword ? <ChangePasswordPanel pushToast={pushToast} /> : null}

      {basePath === routes.settingsForgot ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
          <p className="mb-4 text-lg font-semibold text-[#2e3d4d] md:text-2xl">Enter your email address to get a verification code for resetting your password.</p>
          <Field label="Email" value="Enter your email" readOnly />
          <button className="btn-primary mt-4" onClick={() => navigate(routes.settingsOtp)}>
            Get OTP
          </button>
        </div>
      ) : null}

      {basePath === routes.settingsOtp ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
          <p className="mb-4 text-lg font-semibold text-[#2e3d4d] md:text-2xl">Please check your email. We have sent a code to contact@gmail.com</p>
          <OtpBoxes />
          <div className="mt-3 flex justify-between text-[#67757e]">
            <span>Didn't receive code?</span>
            <button className="underline">Resend</button>
          </div>
          <button className="btn-primary mt-4" onClick={() => navigate(routes.changePassword)}>
            Verify
          </button>
        </div>
      ) : null}

      {basePath === routes.privacy && !privacyLoading ? (
        <ContentManagementPage
          title="Privacy Policy"
          value={privacyText}
          onChange={setPrivacyText}
          onSave={savePrivacy}
          saving={savingCms}
          publicPath={routes.publicPrivacy}
        />
      ) : null}

      {basePath === routes.about && !aboutLoading ? (
        <ContentManagementPage title="About Us" value={aboutText} onChange={setAboutText} onSave={saveAbout} saving={savingCms} publicPath={routes.publicAbout} />
      ) : null}

      {basePath === routes.terms && !termsLoading ? (
        <ContentManagementPage
          title="Terms & Conditions"
          value={termsText}
          onChange={setTermsText}
          onSave={saveTerms}
          saving={savingCms}
          publicPath={routes.publicTerms}
        />
      ) : null}
    </>
  )

  return (
    <>
      <AdminLayout path={basePath} adminProfile={profileDraft}>
        {page}
      </AdminLayout>
      {path === routes.userDetails ? (
        <UserDetailsModal
          user={selectedUser}
          blocked={selectedUserBlocked}
          onClose={() => navigate(selectedUserSource)}
          onAction={() => openBlockConfirm(selectedUser, selectedUserBlocked ? 'unblock' : 'block', selectedUserSource)}
        />
      ) : null}
      {path === routes.blockConfirm ? (
        <ConfirmModal
          title={pendingUserAction?.action === 'unblock' ? 'Do you want to Unblock this user?' : 'Do you want to Block this user?'}
          onConfirm={handleConfirmUserAction}
          onCancel={handleCancelUserAction}
        />
      ) : null}
      {path === routes.transaction ? <TransactionModal transaction={selectedTransaction} onClose={() => navigate(routes.earnings)} /> : null}
      {path === routes.manageFees ? (
        <ManageFeesModal
          config={subscriptionConfig}
          onConfigChange={updateSubscriptionConfig}
          pushToast={pushToast}
          onClose={() => navigate(routes.subscriptions)}
        />
      ) : null}
      {path === routes.logoutConfirm ? <ConfirmModal title="Confirm logging out!" onConfirm={handleLogout} onCancel={() => navigate(routes.dashboard)} /> : null}
    </>
  )
}

function ContentManagementPage({ title, value, onChange, onSave, saving, publicPath }) {
  const publicUrl = typeof window === 'undefined' ? publicPath : `${window.location.origin}${publicPath}`
  const handleCopyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
    } catch {
      window.prompt('Copy this public URL', publicUrl)
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--fitco-border)] bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e5eee6] bg-white/95 px-4 py-3 backdrop-blur md:px-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[#253a49] md:text-3xl">{title}</h3>
          <p className="mt-1 text-sm text-[#738592]">Manage content shown in the Fitco app.</p>
        </div>
        <button className="btn-primary w-auto px-7" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="p-4 md:p-6">
        <div className="mb-4 rounded-2xl border border-[#dce8de] bg-[#f6fbf6] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78907b]">Public URL</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <code className="block overflow-x-auto rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#2f9b38]">{publicUrl}</code>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-outline w-auto px-5" onClick={handleCopyPublicUrl}>
                Copy URL
              </button>
              <button type="button" className="btn-outline w-auto px-5" onClick={() => navigate(publicPath)}>
                Open public page
              </button>
            </div>
          </div>
        </div>
        <RichTextEditor value={value} onChange={onChange} />
      </div>
    </div>
  )
}

function ChangePasswordPanel({ pushToast }) {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      pushToast('All password fields are required.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      pushToast('New passwords do not match.', 'error')
      return
    }

    setSaving(true)
    try {
      await api.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      pushToast('Password changed successfully.')
    } catch {
      pushToast('Failed to change password.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
      <div className="mb-4 border-b border-[#e5eee6] pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a9aa6]">Security</p>
        <h4 className="mt-1 text-xl font-bold text-[#2b3d4e] md:text-2xl">Update Password</h4>
      </div>
      <div className="space-y-4">
        <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} setShow={setShowCurrent} />
        <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} setShow={setShowNew} />
        <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} setShow={setShowConfirm} />
        <div className="text-right">
          <button className="text-sm text-[#77a67a] underline" onClick={() => navigate(routes.settingsForgot)}>
            Forgot password?
          </button>
        </div>
        <button className="btn-primary" onClick={handleChangePassword} disabled={saving}>
          {saving ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, setShow }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#34475a] md:text-base">{label}</span>
      <div className="relative">
        <input
          className="field pr-12"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8da0ad]"
          onClick={() => setShow((prev) => !prev)}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </label>
  )
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null)
  const editorConfig = useMemo(
    () => ({
      readonly: false,
      statusbar: false,
      toolbarSticky: false,
      showCharsCounter: false,
      showWordsCounter: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      height: 320,
      minHeight: 320,
      controls: {
        fontsize: {
          list: ['10', '12', '14', '16', '18', '20', '24', '28', '32', '40'],
        },
      },
      buttons: [
        'bold',
        'italic',
        'underline',
        '|',
        'fontsize',
        'brush',
        '|',
        'ul',
        'ol',
        'outdent',
        'indent',
        '|',
        'left',
        'center',
        'right',
        'justify',
      ],
      buttonsMD: ['bold', 'italic', 'underline', '|', 'fontsize', 'ul', 'ol', '|', 'left', 'center', 'right'],
      buttonsSM: ['bold', 'italic', 'underline', '|', 'fontsize', 'ul', 'ol', '|', 'left', 'center', 'right'],
      buttonsXS: ['bold', 'italic', 'underline', '|', 'fontsize', 'ul', 'ol', '|', 'left', 'center', 'right'],
      removeButtons: ['source', 'image', 'video', 'file', 'table', 'link', 'superscript', 'subscript'],
      disablePlugins: ['about', 'print', 'preview', 'search', 'file', 'image', 'video'],
    }),
    [],
  )

  return (
    <div className="overflow-hidden rounded-xl border border-[#ccdbcf]">
      <JoditEditor
        ref={editorRef}
        value={value || ''}
        config={editorConfig}
        onBlur={(nextValue) => onChange(nextValue)}
        onChange={() => {}}
      />
    </div>
  )
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-[70] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${
            toast.type === 'error' ? 'bg-[#f45a5a] text-white' : 'bg-[#2f9b38] text-white'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

function UserDetailsModal({ user, blocked, onClose, onAction }) {
  const detailUser = user || {
    name: 'John Doe',
    email: 'john@email.com',
    phone: '+12313412',
    joinedDate: '02-24-2024',
  }
  const initials = String(detailUser.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <ModalCard title="User Details" subtitle={`See all details about ${detailUser.name || 'User'}`} onClose={onClose}>
      <div className="mb-4 flex items-center gap-4">
        <div className="avatar">{initials || 'U'}</div>
        <h3 className="text-3xl font-semibold text-[#46b14b] md:text-4xl">{detailUser.name}</h3>
      </div>
      <InfoRow k="Name" v={detailUser.name || '-'} />
      <InfoRow k="Email" v={detailUser.email || '-'} />
      <InfoRow k="Phone" v={detailUser.phone || '-'} />
      <InfoRow k="Joining Date" v={detailUser.joinedDate || detailUser.date || '-'} />
      <div className="mt-7 grid gap-3 md:grid-cols-2">
        <button className="btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" onClick={onAction}>
          {blocked ? 'Unblock' : 'Block'}
        </button>
      </div>
    </ModalCard>
  )
}

function TransactionModal({ transaction, onClose }) {
  const detail = transaction || {
    transactionId: '#-',
    displayTransactionId: 'TXN-NA',
    trxId: '#-',
    plan: '-',
    date: '-',
    name: 'Unknown User',
    accountNo: '-',
    email: '-',
    price: `${REPORTING_CURRENCY} 0.00`,
    originalPrice: `${REPORTING_CURRENCY} 0.00`,
    reportingPrice: `${REPORTING_CURRENCY} 0.00`,
    showReportingPrice: false,
    showOriginalPrice: false,
    originalRegionLabel: null,
    status: '-',
    reference: '#-',
  }

  return (
    <ModalCard title="Transaction Details" onClose={onClose}>
      <InfoRow k="Transaction ID" v={detail.displayTransactionId || detail.transactionId || detail.trxId || '#-'} />
      <InfoRow k="Plans" v={detail.plan || '-'} />
      <InfoRow k="Date" v={detail.date || '-'} />
      <InfoRow k="Name" v={detail.name || '-'} />
      <InfoRow k="A/C number" v={detail.accountNo || '-'} />
      <InfoRow k="Email" v={detail.email || '-'} />
      <InfoRow k="Status" v={detail.status || '-'} />
      <InfoRow k="SAR reporting amount" v={detail.reportingPrice || detail.price || `${REPORTING_CURRENCY} 0.00`} />
      {detail.showOriginalPrice ? (
        <InfoRow
          k={detail.originalRegionLabel ? `Original charged amount (${detail.originalRegionLabel})` : 'Original charged amount'}
          v={detail.originalPrice || 'N/A'}
        />
      ) : null}
      <div className="mt-7 grid gap-3 md:grid-cols-2">
        <button className="btn-outline" onClick={() => navigate(routes.earnings)}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => navigate(routes.earnings)}>
          Download Invoice
        </button>
      </div>
    </ModalCard>
  )
}

function ManageFeesModal({ config, onConfigChange, pushToast, onClose }) {
  const [monthlyFee, setMonthlyFee] = useState(config.monthlyFee)
  const [yearlyFee, setYearlyFee] = useState(config.yearlyFee)
  const [couponCode, setCouponCode] = useState(config.couponCode)
  const [discountPercent, setDiscountPercent] = useState(config.discountPercent)
  const [couponExpiry, setCouponExpiry] = useState(config.couponExpiry || '')
  const [couponExpiryDate, setCouponExpiryDate] = useState(config.couponExpiry ? config.couponExpiry.split('T')[0] : '')
  const [couponExpiryTime, setCouponExpiryTime] = useState(config.couponExpiry ? config.couponExpiry.split('T')[1] : '')
  const [saving, setSaving] = useState(false)
  const [addingCoupon, setAddingCoupon] = useState(false)
  const [removingCoupon, setRemovingCoupon] = useState(false)

  useEffect(() => {
    setMonthlyFee(config.monthlyFee)
    setYearlyFee(config.yearlyFee)
    setCouponCode(config.couponCode)
    setDiscountPercent(config.discountPercent)
    setCouponExpiry(config.couponExpiry || '')
    setCouponExpiryDate(config.couponExpiry ? config.couponExpiry.split('T')[0] : '')
    setCouponExpiryTime(config.couponExpiry ? config.couponExpiry.split('T')[1] : '')
  }, [config])

  useEffect(() => {
    let isMounted = true

    const loadCoupon = async () => {
      try {
        const couponsPayload = await api.listCoupons()
        const coupons = Array.isArray(couponsPayload) ? couponsPayload : Array.isArray(couponsPayload?.data) ? couponsPayload.data : []
        const latest = coupons[0]
        if (!latest || !isMounted) return

        setCouponCode(String(latest.code || ''))
        setDiscountPercent(Number(latest.discountPercentage || 0))
        const localExpiry = toDateTimeLocalValue(latest.expiryDate)
        setCouponExpiry(localExpiry)
        setCouponExpiryDate(localExpiry ? localExpiry.split('T')[0] : '')
        setCouponExpiryTime(localExpiry ? localExpiry.split('T')[1] : '')
      } catch {
        // Keep manual fields when coupons cannot be loaded.
      }
    }

    loadCoupon()
    return () => {
      isMounted = false
    }
  }, [])

  const decreaseDiscount = () => setDiscountPercent((prev) => Math.max(0, prev - 1))
  const increaseDiscount = () => setDiscountPercent((prev) => Math.min(100, prev + 1))
  const handleDiscountInput = (value) => {
    const digitsOnly = value.replace(/[^\d]/g, '')
    if (!digitsOnly) {
      setDiscountPercent(0)
      return
    }
    const parsed = Number(digitsOnly)
    setDiscountPercent(Math.min(100, Math.max(0, parsed)))
  }

  const handleSave = async () => {
    const validMonthly = Number(monthlyFee)
    const validYearly = Number(yearlyFee)

    if (!Number.isFinite(validMonthly) || validMonthly <= 0 || !Number.isFinite(validYearly) || validYearly <= 0) {
      pushToast('Please enter valid monthly and yearly prices.', 'error')
      return
    }

    setSaving(true)
    try {
      await api.updateSubscriptionPricing({
        monthlyPriceCents: Math.round(validMonthly * 100),
        yearlyPriceCents: Math.round(validYearly * 100),
        currency: 'usd',
      })

      onConfigChange({
        monthlyFee: validMonthly.toFixed(2),
        yearlyFee: validYearly.toFixed(2),
        couponCode: couponCode.trim() || 'PREMIUM50',
        discountPercent,
      })
      pushToast('Subscription settings updated successfully.')
      onClose?.()
    } catch (error) {
      pushToast(getErrorMessage(error, 'Failed to update subscription settings.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    const discount = Number(discountPercent)
    const expiryRaw = couponExpiry.trim()

    if (!code) {
      pushToast('Coupon code is required.', 'error')
      return
    }
    if (!Number.isInteger(discount) || discount <= 0 || discount > 100) {
      pushToast('Discount must be an integer between 1 and 100.', 'error')
      return
    }
    if (!expiryRaw) {
      pushToast('Expiry date and time is required.', 'error')
      return
    }
    const expiry = new Date(expiryRaw)
    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      pushToast('Please select a future expiry date and time.', 'error')
      return
    }

    setAddingCoupon(true)
    try {
      const couponsPayload = await api.listCoupons()
      const coupons = Array.isArray(couponsPayload) ? couponsPayload : Array.isArray(couponsPayload?.data) ? couponsPayload.data : []
      const existing = coupons.find((coupon) => String(coupon?.code || '').toUpperCase() === code)

      if (existing?._id || existing?.id) {
        await api.updateCoupon({
          couponId: existing._id || existing.id,
          discountPercentage: discount,
          expiryDate: expiry.toISOString(),
        })
      } else {
        await api.createCoupon({
          code,
          discountPercentage: discount,
          expiryDate: expiry.toISOString(),
        })
      }
      onConfigChange({
        couponCode: code,
        discountPercent: discount,
        couponExpiry: toDateTimeLocalValue(expiry.toISOString()),
      })
      pushToast(existing ? 'Coupon updated successfully.' : 'Coupon added successfully.')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Failed to add coupon.'), 'error')
    } finally {
      setAddingCoupon(false)
    }
  }

  const updateExpiryFromParts = (nextDate, nextTime) => {
    setCouponExpiryDate(nextDate)
    setCouponExpiryTime(nextTime)
    if (!nextDate) {
      setCouponExpiry('')
      return
    }
    setCouponExpiry(`${nextDate}T${nextTime || '23:59'}`)
  }

  const setExpiryPreset = (daysToAdd) => {
    const preset = new Date()
    preset.setDate(preset.getDate() + daysToAdd)
    preset.setHours(23, 59, 0, 0)
    const local = toDateTimeLocalValue(preset.toISOString())
    setCouponExpiry(local)
    setCouponExpiryDate(local.split('T')[0] || '')
    setCouponExpiryTime(local.split('T')[1] || '23:59')
  }

  const handleRemoveCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      pushToast('Enter coupon code to remove.', 'error')
      return
    }

    setRemovingCoupon(true)
    try {
      const couponsPayload = await api.listCoupons()
      const coupons = Array.isArray(couponsPayload) ? couponsPayload : Array.isArray(couponsPayload?.data) ? couponsPayload.data : []
      const existing = coupons.find((coupon) => String(coupon?.code || '').toUpperCase() === code)

      if (!(existing?._id || existing?.id)) {
        pushToast('Coupon not found.', 'error')
        return
      }

      await api.deleteCoupon({ couponId: existing._id || existing.id })
      onConfigChange({
        couponCode: '',
        couponExpiry: '',
      })
      setCouponCode('')
      setCouponExpiry('')
      setCouponExpiryDate('')
      setCouponExpiryTime('')
      pushToast('Coupon removed successfully.')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Failed to remove coupon.'), 'error')
    } finally {
      setRemovingCoupon(false)
    }
  }

  return (
    <ModalCard title="Manage Fees" max="max-w-4xl" onClose={onClose}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 md:border-r md:border-[#cde2cf] md:pr-6">
          <h4 className="text-xl font-semibold text-[#2e3d4d] md:text-2xl">Subscriptions Fees</h4>
          <div className="rounded-xl border border-[#dfe8e1] p-4">
            <p className="mb-2 text-base md:text-lg">Premium monthly plan</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a7d88]">$</span>
              <input className="field pl-8" value={monthlyFee} onChange={(event) => setMonthlyFee(event.target.value)} />
            </div>
          </div>
          <div className="rounded-xl border border-[#dfe8e1] p-4">
            <p className="mb-2 text-base md:text-lg">Premium yearly plan</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a7d88]">$</span>
              <input className="field pl-8" value={yearlyFee} onChange={(event) => setYearlyFee(event.target.value)} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-[#2e3d4d] md:text-2xl">Coupons</h4>
          <div className="rounded-xl border border-[#dfe8e1] p-4">
            <p className="mb-2 text-base md:text-lg">Coupon Code</p>
            <input className="field" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} />
            <p className="my-3 text-base md:text-lg">Discount Value</p>
            <div className="flex items-center gap-4 text-base md:text-lg">
              <button type="button" className="grid h-8 w-8 place-content-center rounded-full bg-[#efefef]" onClick={decreaseDiscount}>
                -
              </button>
              <div className="relative w-[92px]">
                <input
                  className="field h-10 pr-7 text-center"
                  value={discountPercent}
                  onChange={(event) => handleDiscountInput(event.target.value)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6a7d88]">%</span>
              </div>
              <button type="button" className="grid h-8 w-8 place-content-center rounded-full bg-[#d7f0d8] text-[#44b249]" onClick={increaseDiscount}>
                +
              </button>
            </div>
            <p className="mb-2 mt-4 text-base md:text-lg">Expiry Date & Time</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8e99]">Date</p>
                <input
                  type="date"
                  className="field"
                  value={couponExpiryDate}
                  onChange={(event) => updateExpiryFromParts(event.target.value, couponExpiryTime)}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8e99]">Time</p>
                <input
                  type="time"
                  className="field"
                  value={couponExpiryTime}
                  onChange={(event) => updateExpiryFromParts(couponExpiryDate, event.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="rounded-lg border border-[#cde2cf] bg-[#f5fbf5] px-3 py-1.5 text-xs font-semibold text-[#2f9b38]" onClick={() => setExpiryPreset(7)}>
                +7 days
              </button>
              <button type="button" className="rounded-lg border border-[#cde2cf] bg-[#f5fbf5] px-3 py-1.5 text-xs font-semibold text-[#2f9b38]" onClick={() => setExpiryPreset(30)}>
                +30 days
              </button>
              <button type="button" className="rounded-lg border border-[#cde2cf] bg-[#f5fbf5] px-3 py-1.5 text-xs font-semibold text-[#2f9b38]" onClick={() => setExpiryPreset(90)}>
                +90 days
              </button>
            </div>
            <p className="mt-2 text-xs text-[#7b8e99]">
              {couponExpiry && !Number.isNaN(new Date(couponExpiry).getTime())
                ? `Selected expiry: ${new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  }).format(new Date(couponExpiry))}`
                : 'Coupon will expire automatically at the selected local date and time.'}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <button className="btn-primary" onClick={handleAddCoupon} disabled={addingCoupon || removingCoupon}>
              {addingCoupon ? 'Adding Coupon...' : '+ Add / Update Coupon'}
            </button>
            <button className="btn-outline" onClick={handleRemoveCoupon} disabled={addingCoupon || removingCoupon}>
              {removingCoupon ? 'Removing...' : 'Remove Coupon'}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Updating...' : 'Update fee'}
        </button>
      </div>
    </ModalCard>
  )
}

function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <ModalCard title={title} subtitle="" centerTitle onClose={onCancel}>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <button className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button className="rounded-xl bg-[#f44a4a] px-5 py-2.5 text-sm font-semibold text-white md:text-base" onClick={onConfirm}>
          Yes, Confirm
        </button>
      </div>
    </ModalCard>
  )
}

function UnknownRoute() {
  return (
    <section className="mx-auto mt-16 max-w-xl rounded-xl border border-[#dfe8e1] bg-white p-6 text-center">
      <h2 className="text-2xl font-semibold text-[#223442]">Page not found</h2>
      <p className="mt-2 text-[#5d7380]">This route is not part of the Fitco dashboard flow.</p>
      <button className="btn-primary mx-auto mt-4 max-w-xs" onClick={() => navigate(defaultRoute)}>
        Go to Login
      </button>
    </section>
  )
}

export default App
