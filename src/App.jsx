import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AdminLayout } from './components/AdminLayout'
import { Field, InfoRow, Logo, ModalCard, OtpBoxes, PageLoader } from './components/UI'
import { defaultRoute, routes } from './config/routes'
import DashboardPage from './features/admin/dashboard/DashboardPage'
import EarningsPage from './features/admin/earnings/EarningsPage'
import ReportsPage from './features/admin/reports/ReportsPage'
import SettingsPage from './features/admin/settings/SettingsPage'
import SubscriptionsPage from './features/admin/subscriptions/SubscriptionsPage'
import UsersPage from './features/admin/users/UsersPage'
import { useAsyncData } from './hooks/useAsyncData'
import { navigate, useRouter } from './hooks/useRouter'
import { api } from './services/api'
import { clearToken, isAuthenticated, setToken } from './services/auth'

const isAuthRoute = (path) => path.startsWith('/auth')
const isAdminRoute = (path) => path.startsWith('/admin')
const PAGE_SIZE = 8
const getErrorMessage = (error, fallback) => error?.payload?.message || error?.message || fallback

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
      navigate(authenticated ? routes.dashboard : defaultRoute)
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
    <main className={`app-bg min-h-screen ${isAdminRoute(path) ? 'p-0 md:p-0' : 'p-3 md:p-5'}`}>
      {isAuthRoute(path) ? <AuthRoutes onAuthSuccess={() => setAuthenticated(true)} /> : null}
      {isAdminRoute(path) ? <AdminRoutes path={path} onLogout={() => setAuthenticated(false)} pushToast={pushToast} /> : null}
      {!isAuthRoute(path) && !isAdminRoute(path) && path !== '/' ? <UnknownRoute /> : null}
      <ToastStack toasts={toasts} />
    </main>
  )
}

function AuthRoutes({ onAuthSuccess }) {
  const { path } = useRouter()

  const [email, setEmail] = useState('mostain@gamil.com')
  const [password, setPassword] = useState('12345678')
  const [confirmPassword, setConfirmPassword] = useState('12345678')
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
        navigate(routes.otp)
      } else {
        setError('Unable to sign in. Please try again.')
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to sign in. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [email, password])

  const handleOtpVerify = useCallback(async () => {
    setSubmitting(true)
    setError('')
    try {
      const response = await api.verifyOtp({ email, otp: '80--' })
      if (response?.token) {
        setToken(response.token)
        onAuthSuccess()
        navigate(routes.dashboard)
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Invalid OTP. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [email, onAuthSuccess])

  const handleForgot = useCallback(async () => {
    if (!email) {
      setError('Email is required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.requestPasswordReset({ email })
      navigate(routes.reset)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to send reset code. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [email])

  const handleResetPassword = useCallback(async () => {
    if (!password || !confirmPassword) {
      setError('Password fields are required.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.resetPassword({ email, password, confirmPassword })
      onAuthSuccess()
      navigate(routes.dashboard)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to reset password. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [confirmPassword, email, onAuthSuccess, password])

  return (
    <section className="mx-auto flex min-h-[92vh] max-w-3xl items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--fitco-border)] bg-white px-5 py-8 shadow-xl md:px-14 md:py-10">
        <Logo className="mb-8 text-center" />
        <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-[#1f2b3a] md:text-[42px]">{title}</h1>

        {path === routes.login ? (
          <div className="space-y-4">
            <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-[#495a61]">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--fitco-green)]" />
                Remember password
              </label>
              <button className="text-[#77a67a] underline" onClick={() => navigate(routes.forgot)}>
                Forgot password?
              </button>
            </div>
            <button className="btn-primary mt-1" onClick={handleLogin} disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        ) : null}

        {path === routes.otp ? (
          <div className="space-y-5">
            <p className="text-[#495a61]">Please check your email. We have sent a code to {email}</p>
            <OtpBoxes />
            <div className="flex justify-between text-sm text-[#637681]">
              <span>Didn't receive code?</span>
              <button className="text-[#77a67a] underline">Resend</button>
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
            <Field label="Current Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Field label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button className="btn-primary" onClick={handleResetPassword} disabled={submitting}>
              {submitting ? 'Updating...' : 'Sign Up'}
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm font-medium text-[#e35555]">{error}</p> : null}
      </div>
    </section>
  )
}

function AdminRoutes({ path, onLogout, pushToast }) {
  const loadDashboard = useCallback(() => api.getDashboard(), [])
  const loadUsers = useCallback(() => api.getUsers(), [])
  const loadBlockedUsers = useCallback(() => api.getBlockedUsers(), [])
  const loadEarnings = useCallback(() => api.getEarnings(), [])
  const loadTransactions = useCallback(() => api.getTransactions(), [])
  const loadSubscriptions = useCallback(() => api.getSubscriptions(), [])
  const loadReports = useCallback(() => api.getReports(), [])
  const loadProfile = useCallback(() => api.getProfile(), [])
  const loadPrivacyPolicy = useCallback(() => api.getPrivacyPolicy(), [])
  const loadAboutUs = useCallback(() => api.getAboutUs(), [])
  const loadTerms = useCallback(() => api.getTermsAndConditions(), [])

  const { data: dashboardData, loading: dashboardLoading } = useAsyncData(loadDashboard, {})
  const { data: users, loading: usersLoading } = useAsyncData(loadUsers, [])
  const { data: blockedUsers, loading: blockedUsersLoading } = useAsyncData(loadBlockedUsers, [])
  const { data: earningsData, loading: earningsLoading } = useAsyncData(loadEarnings, {})
  const { data: transactions, loading: transactionsLoading } = useAsyncData(loadTransactions, [])
  const { data: subscriptions, loading: subscriptionsLoading } = useAsyncData(loadSubscriptions, [])
  const { data: reports, loading: reportsLoading } = useAsyncData(loadReports, [])
  const { data: profile, loading: profileLoading } = useAsyncData(loadProfile, {})
  const { data: privacyPayload, loading: privacyLoading } = useAsyncData(loadPrivacyPolicy, { content: '' })
  const { data: aboutPayload, loading: aboutLoading } = useAsyncData(loadAboutUs, { content: '' })
  const { data: termsPayload, loading: termsLoading } = useAsyncData(loadTerms, { content: '' })

  const [privacyText, setPrivacyText] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [termsText, setTermsText] = useState('')
  const [savingCms, setSavingCms] = useState(false)
  const [profileDraft, setProfileDraft] = useState({ username: '', email: '', contactNo: '', name: '' })
  const [subscriptionConfig, setSubscriptionConfig] = useState({
    monthlyFee: '9.99',
    yearlyFee: '99.99',
    couponCode: 'PREMIUM50',
    discountPercent: 10,
  })
  const [usersPage, setUsersPage] = useState(1)
  const [blockedUsersPage, setBlockedUsersPage] = useState(1)
  const [earningsPage, setEarningsPage] = useState(1)
  const [subscriptionsPage, setSubscriptionsPage] = useState(1)
  const [reportsPage, setReportsPage] = useState(1)
  const [activeUsers, setActiveUsers] = useState([])
  const [blockedUsersState, setBlockedUsersState] = useState([])
  const [pendingUserAction, setPendingUserAction] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserBlocked, setSelectedUserBlocked] = useState(false)
  const [selectedUserSource, setSelectedUserSource] = useState(routes.users)

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
    const maxPage = Math.max(1, Math.ceil(activeUsers.length / PAGE_SIZE))
    if (usersPage > maxPage) setUsersPage(maxPage)
  }, [activeUsers.length, usersPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(blockedUsersState.length / PAGE_SIZE))
    if (blockedUsersPage > maxPage) setBlockedUsersPage(maxPage)
  }, [blockedUsersPage, blockedUsersState.length])

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

  const handleConfirmUserAction = useCallback(() => {
    if (!pendingUserAction?.user || !pendingUserAction?.action) {
      navigate(routes.users)
      return
    }

    const { user, action, source } = pendingUserAction
    if (action === 'block') {
      setActiveUsers((prev) => prev.filter((item) => item !== user))
      setBlockedUsersState((prev) => [user, ...prev.filter((item) => item !== user)])
      pushToast(`${user.name} blocked successfully.`)
      navigate(source === routes.dashboard ? routes.dashboard : routes.blockedUsers)
    } else {
      setBlockedUsersState((prev) => prev.filter((item) => item !== user))
      setActiveUsers((prev) => [user, ...prev.filter((item) => item !== user)])
      pushToast(`${user.name} unblocked successfully.`)
      navigate(source === routes.dashboard ? routes.dashboard : routes.users)
    }
    setPendingUserAction(null)
  }, [pendingUserAction, pushToast])

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

  const handleReportAction = useCallback(
    async (action, reportUser) => {
      const targetUser = findUserByReport(reportUser)
      const userId = targetUser?.id || reportUser.userId || null

      if (action === 'warn') {
        try {
          await api.warnUser({ userId, reportId: reportUser.id, reason: reportUser.reason })
          pushToast(`Warning sent to ${reportUser.name}.`)
        } catch (error) {
          pushToast(getErrorMessage(error, `Failed to warn ${reportUser.name}.`), 'error')
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
          pushToast(`${reportUser.name} account disabled.`)
        } catch (error) {
          pushToast(getErrorMessage(error, `Failed to disable ${reportUser.name}.`), 'error')
        }
        return
      }

      if (!targetUser) {
        pushToast(`Account not found for ${reportUser.name}.`, 'error')
        return
      }
      try {
        await api.unblockUser({ userId, reportId: reportUser.id })
        setBlockedUsersState((prev) => prev.filter((u) => u !== targetUser))
        setActiveUsers((prev) => [targetUser, ...prev.filter((u) => u !== targetUser)])
        pushToast(`${reportUser.name} account unblocked.`)
      } catch (error) {
        pushToast(getErrorMessage(error, `Failed to unblock ${reportUser.name}.`), 'error')
      }
    },
    [findUserByReport, pushToast],
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
            users={activeUsers}
            onViewUser={(user) => openUserDetails(user, false, routes.dashboard)}
            onBlockUser={(user) => openBlockConfirm(user, 'block', routes.dashboard)}
          />
        ))}

      {basePath === routes.users &&
        (
          <UsersPage
            loading={usersLoading}
            rows={paginate(activeUsers, usersPage)}
            page={usersPage}
            pageSize={PAGE_SIZE}
            totalItems={activeUsers.length}
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
            onViewTransaction={() => navigate(routes.transaction)}
          />
        )}

      {basePath === routes.subscriptions &&
        (
          <SubscriptionsPage
            loading={subscriptionsLoading}
            subscriptions={paginate(subscriptions, subscriptionsPage)}
            page={subscriptionsPage}
            pageSize={PAGE_SIZE}
            totalItems={subscriptions.length}
            onPageChange={setSubscriptionsPage}
            onManageFees={() => navigate(routes.manageFees)}
          />
        )}

      {basePath === routes.reports &&
        (
          <ReportsPage
            loading={reportsLoading}
            reports={paginate(reports, reportsPage)}
            page={reportsPage}
            pageSize={PAGE_SIZE}
            totalItems={reports.length}
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
              <div className="avatar">MA</div>
              <h3 className="mt-3 text-3xl font-bold text-[#2a3946] md:text-[42px]">{profileDraft.name || profile.name}</h3>
              <div className="mt-2 flex gap-6 text-sm md:text-base">
                <button className="font-semibold text-[var(--fitco-green)] underline">Edit Profile</button>
                <button className="text-[#7a8c90]" onClick={() => navigate(routes.changePassword)}>
                  Change Password
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Field label="User Name" value={profileDraft.username || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, username: event.target.value }))} />
              <Field label="Email" value={profileDraft.email || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))} />
              <Field label="Contact No" value={profileDraft.contactNo || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, contactNo: event.target.value }))} />
              <button className="btn-primary" onClick={() => pushToast('Profile updated successfully.')}>Update Profile</button>
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
        <ContentManagementPage title="Privacy Policy" value={privacyText} onChange={setPrivacyText} onSave={savePrivacy} saving={savingCms} />
      ) : null}

      {basePath === routes.about && !aboutLoading ? (
        <ContentManagementPage title="About Us" value={aboutText} onChange={setAboutText} onSave={saveAbout} saving={savingCms} />
      ) : null}

      {basePath === routes.terms && !termsLoading ? (
        <ContentManagementPage title="Terms & Conditions" value={termsText} onChange={setTermsText} onSave={saveTerms} saving={savingCms} />
      ) : null}
    </>
  )

  return (
    <>
      <AdminLayout path={basePath}>{page}</AdminLayout>
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
      {path === routes.transaction ? <TransactionModal onClose={() => navigate(routes.earnings)} /> : null}
      {path === routes.manageFees ? <ManageFeesModal config={subscriptionConfig} onConfigChange={updateSubscriptionConfig} pushToast={pushToast} onClose={() => navigate(routes.subscriptions)} /> : null}
      {path === routes.logoutConfirm ? <ConfirmModal title="Confirm logging out!" onConfirm={handleLogout} onCancel={() => navigate(routes.dashboard)} /> : null}
    </>
  )
}

function ContentManagementPage({ title, value, onChange, onSave, saving }) {
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
      await new Promise((resolve) => setTimeout(resolve, 400))
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

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const apply = (command, commandValue = null) => {
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current?.innerHTML || '')
  }

  return (
    <div className="rounded-xl border border-[#ccdbcf]">
      <div className="rt-toolbar">
        <button type="button" onClick={() => apply('bold')}>B</button>
        <button type="button" onClick={() => apply('italic')}><em>I</em></button>
        <button type="button" onClick={() => apply('underline')}><u>U</u></button>
        <button type="button" onClick={() => apply('insertUnorderedList')}>• List</button>
        <button type="button" onClick={() => apply('insertOrderedList')}>1. List</button>
        <button type="button" onClick={() => apply('justifyLeft')}>Left</button>
        <button type="button" onClick={() => apply('justifyCenter')}>Center</button>
        <button type="button" onClick={() => apply('justifyRight')}>Right</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="rt-content"
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
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

function TransactionModal({ onClose }) {
  return (
    <ModalCard title="Transaction Details" onClose={onClose}>
      <InfoRow k="Transaction ID" v="#12345678" />
      <InfoRow k="Plans" v="Monthly Subscription" />
      <InfoRow k="Date" v="02-24-2024" />
      <InfoRow k="Name" v="John Doe." />
      <InfoRow k="A/C number" v="**** **** **** *545" />
      <InfoRow k="Email" v="john@email.com" />
      <InfoRow k="Transaction amount" v="$9.99" />
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

  useEffect(() => {
    setMonthlyFee(config.monthlyFee)
    setYearlyFee(config.yearlyFee)
    setCouponCode(config.couponCode)
    setDiscountPercent(config.discountPercent)
  }, [config])

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

  const handleSave = () => {
    const validMonthly = Number(monthlyFee)
    const validYearly = Number(yearlyFee)

    if (!Number.isFinite(validMonthly) || validMonthly <= 0 || !Number.isFinite(validYearly) || validYearly <= 0) {
      pushToast('Please enter valid monthly and yearly prices.', 'error')
      return
    }

    onConfigChange({
      monthlyFee: validMonthly.toFixed(2),
      yearlyFee: validYearly.toFixed(2),
      couponCode: couponCode.trim() || 'PREMIUM50',
      discountPercent,
    })
    pushToast('Subscription settings updated successfully.')
    onClose?.()
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
          </div>
          <button className="btn-primary" onClick={() => pushToast('Coupon added to current fee settings.')}>
            + Add New Coupon
          </button>
        </div>
      </div>
      <div className="mt-6">
        <button className="btn-primary" onClick={handleSave}>
          Update fee
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
