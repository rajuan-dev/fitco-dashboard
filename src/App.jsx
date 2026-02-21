import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AdminLayout } from './components/AdminLayout'
import { BasicTable, UsersTable } from './components/Tables'
import UserRatioChart from './components/Dashboard/UserRatioChart'
import { Field, InfoRow, Logo, ModalCard, OtpBoxes, PageLoader, StatCard } from './components/UI'
import { defaultRoute, routes } from './config/routes'
import { useAsyncData } from './hooks/useAsyncData'
import { navigate, useRouter } from './hooks/useRouter'
import { api } from './services/api'
import { clearToken, isAuthenticated, setToken } from './services/auth'

const isAuthRoute = (path) => path.startsWith('/auth')
const isAdminRoute = (path) => path.startsWith('/admin')
const PAGE_SIZE = 8

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

  const page = (
    <>
      {path === routes.dashboard && (dashboardLoading ? <PageLoader /> : <DashboardPage data={dashboardData} users={users} />)}

      {path === routes.users &&
        (usersLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-4">
            <ListHeader buttonText="Blocked Users" onButtonClick={() => navigate(routes.blockedUsers)} />
            <UsersTable rows={paginate(users, usersPage)} onView={() => navigate(routes.userDetails)} onToggleBlock={() => navigate(routes.blockConfirm)} hideFooter />
            <PaginationBar currentPage={usersPage} totalItems={users.length} pageSize={PAGE_SIZE} onPageChange={setUsersPage} />
          </div>
        ))}

      {path === routes.blockedUsers &&
        (blockedUsersLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-4">
            <ListHeader buttonText="Active Users" onButtonClick={() => navigate(routes.users)} />
            <UsersTable rows={paginate(blockedUsers, blockedUsersPage)} blocked onView={() => navigate(routes.userDetails)} onToggleBlock={() => navigate(routes.userDetails)} hideFooter />
            <PaginationBar currentPage={blockedUsersPage} totalItems={blockedUsers.length} pageSize={PAGE_SIZE} onPageChange={setBlockedUsersPage} />
          </div>
        ))}

      {path === routes.earnings &&
        (earningsLoading || transactionsLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard value={earningsData.today} label="Today" />
              <StatCard value={earningsData.thisMonth} label="This Month" />
              <StatCard value={earningsData.totalRevenue} label="Total Revenue" />
            </div>
            <BasicTable
              headers={['S.ID', 'Full Name', 'Trx ID', 'Plans', 'Price', 'Date', 'Action']}
              avatarColumnIndex={1}
              rows={paginate(transactions, earningsPage).map((t) => [
                t.id,
                t.name,
                t.trxId,
                t.plan,
                t.price,
                t.date,
                <button key={`trx-${t.id}`} className="text-[var(--fitco-green)]" onClick={() => navigate(routes.transaction)}>
                  ◉
                </button>,
              ])}
            />
            <PaginationBar currentPage={earningsPage} totalItems={transactions.length} pageSize={PAGE_SIZE} onPageChange={setEarningsPage} />
          </div>
        ))}

      {path === routes.subscriptions &&
        (subscriptionsLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input className="field max-w-[380px]" placeholder="Search User" />
              <button onClick={() => navigate(routes.manageFees)} className="btn-primary w-auto px-5">
                Manage Fees
              </button>
            </div>
            <BasicTable
              headers={['S.ID', 'User', 'Email', 'Status', 'Plans', 'Expiration Date']}
              avatarColumnIndex={1}
              rows={paginate(subscriptions, subscriptionsPage).map((s) => [
                s.id,
                s.name,
                s.email,
                <span key={`status-${s.id}`} className={s.status === 'Paid' ? 'font-semibold text-[#53bc88]' : 'font-semibold text-[#ef5a5a]'}>
                  {s.status}
                </span>,
                s.plan,
                s.expirationDate,
              ])}
            />
            <PaginationBar currentPage={subscriptionsPage} totalItems={subscriptions.length} pageSize={PAGE_SIZE} onPageChange={setSubscriptionsPage} />
          </div>
        ))}

      {path === routes.reports &&
        (reportsLoading ? (
          <PageLoader />
        ) : (
          <>
            <BasicTable
              headers={['S.ID', 'Report From', 'Email', 'Report Reason', 'Date & Time']}
              avatarColumnIndex={1}
              rows={paginate(reports, reportsPage).map((r) => [r.id, r.name, r.email, r.reason, r.reportedAt])}
            />
            <PaginationBar currentPage={reportsPage} totalItems={reports.length} pageSize={PAGE_SIZE} onPageChange={setReportsPage} />
          </>
        ))}

      {path === routes.profile &&
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

      {path === routes.settings && (
        <div className="rounded-2xl border border-[var(--fitco-border)] bg-white p-3 md:p-4">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a9aa6]">Preferences</p>
          <SettingRow icon="profile" label="Profile" onClick={() => navigate(routes.profile)} />
          <SettingRow icon="password" label="Change Password" onClick={() => navigate(routes.changePassword)} />
          <SettingRow icon="privacy" label="Privacy Policy" onClick={() => navigate(routes.privacy)} />
          <SettingRow icon="terms" label="Terms & Conditions" onClick={() => navigate(routes.terms)} />
          <SettingRow icon="about" label="About Us" onClick={() => navigate(routes.about)} />
        </div>
      )}

      {path === routes.changePassword ? <ChangePasswordPanel pushToast={pushToast} /> : null}

      {path === routes.settingsForgot ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
          <p className="mb-4 text-lg font-semibold text-[#2e3d4d] md:text-2xl">Enter your email address to get a verification code for resetting your password.</p>
          <Field label="Email" value="Enter your email" readOnly />
          <button className="btn-primary mt-4" onClick={() => navigate(routes.settingsOtp)}>
            Get OTP
          </button>
        </div>
      ) : null}

      {path === routes.settingsOtp ? (
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

      {path === routes.privacy && !privacyLoading ? (
        <ContentManagementPage title="Privacy Policy" value={privacyText} onChange={setPrivacyText} onSave={savePrivacy} saving={savingCms} />
      ) : null}

      {path === routes.about && !aboutLoading ? (
        <ContentManagementPage title="About Us" value={aboutText} onChange={setAboutText} onSave={saveAbout} saving={savingCms} />
      ) : null}

      {path === routes.terms && !termsLoading ? (
        <ContentManagementPage title="Terms & Conditions" value={termsText} onChange={setTermsText} onSave={saveTerms} saving={savingCms} />
      ) : null}
    </>
  )

  return (
    <>
      <AdminLayout path={path}>{page}</AdminLayout>
      {path === routes.userDetails ? <UserDetailsModal blocked={false} onClose={() => navigate(routes.users)} /> : null}
      {path === routes.blockConfirm ? <ConfirmModal title="Do you want to Block this user?" onConfirm={() => navigate(routes.blockedUsers)} onCancel={() => navigate(routes.users)} /> : null}
      {path === routes.transaction ? <TransactionModal onClose={() => navigate(routes.earnings)} /> : null}
      {path === routes.manageFees ? <ManageFeesModal config={subscriptionConfig} onConfigChange={updateSubscriptionConfig} pushToast={pushToast} onClose={() => navigate(routes.subscriptions)} /> : null}
      {path === routes.logoutConfirm ? <ConfirmModal title="Confirm logging out!" onConfirm={handleLogout} onCancel={() => navigate(routes.dashboard)} /> : null}
    </>
  )
}

function DashboardPage({ data, users }) {
  const [selectedYear, setSelectedYear] = useState('2024')
  const yearOptions = useMemo(() => ['2024', '2023', '2022'], [])
  const chartData = useMemo(
    () =>
      (data.userRatio || []).map((value, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        users: Number(value?.users ?? value?.value ?? value?.count ?? value) || 0,
      })),
    [data.userRatio],
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard eyebrow="Overview" value={data.totalUsers} label="Total Users" trend="+12% vs last month" />
        <MetricCard eyebrow="Performance" value={data.totalRevenue} label="Total Revenue" trend="+8% vs last month" />
      </div>

      <UserRatioChart data={chartData} selectedYear={selectedYear} onYearChange={setSelectedYear} yearOptions={yearOptions} />

      <UsersTable rows={users.slice(0, 8)} onView={() => navigate(routes.userDetails)} onToggleBlock={() => navigate(routes.blockConfirm)} title="Recent Users" hideFooter />
    </div>
  )
}

function PaginationBar({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalItems)
  const visiblePages = []
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - safePage) <= 1) {
      visiblePages.push(page)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[#6ea672] md:text-sm">
      <span>{`SHOWING ${start}-${end} OF ${totalItems}`}</span>
      <div className="flex items-center gap-1">
        <button className="rounded-md border border-[#cfe3d1] px-2 py-1 text-[#5f7783] disabled:opacity-50" onClick={() => onPageChange(safePage - 1)} disabled={safePage <= 1}>
          Prev
        </button>
        {visiblePages.map((page, index) => (
          <span key={page} className="inline-flex items-center">
            {index > 0 && page - visiblePages[index - 1] > 1 ? <span className="px-1 text-[#7f9790]">…</span> : null}
            <button
              className={`rounded-md border px-2 py-1 ${page === safePage ? 'border-[var(--fitco-green)] bg-[var(--fitco-green)] text-white' : 'border-[#cfe3d1] text-[#5f7783]'}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        ))}
        <button
          className="rounded-md border border-[#cfe3d1] px-2 py-1 text-[#5f7783] disabled:opacity-50"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function ListHeader({ buttonText, onButtonClick }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[260px] flex-1">
        <input className="field pl-10" placeholder="Search User" />
        <span className="absolute left-3 top-2.5 text-lg text-[#6a7f72]">⌕</span>
      </div>
      <button onClick={onButtonClick} className="btn-primary w-auto px-5">
        {buttonText}
      </button>
    </div>
  )
}

function SettingRow({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-transparent px-2 py-3 text-left text-base text-[#2e3d4d] transition hover:border-[#def0e0] hover:bg-[#f4fbf5] hover:text-[var(--fitco-green)] md:px-3 md:text-lg"
    >
      <span className="flex items-center gap-3 font-medium">
        <span className="grid h-6 w-6 place-content-center text-[#7fa0b3]">
          <SettingIcon type={icon} />
        </span>
        <span>{label}</span>
      </span>
      <span className="text-[#8aa0ae]">›</span>
    </button>
  )
}

function SettingIcon({ type }) {
  if (type === 'profile') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4.2 3.8-6 8-6s7.2 1.8 8 6H4z" />
      </svg>
    )
  }

  if (type === 'password') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'privacy') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    )
  }

  if (type === 'terms') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 3h10v18H7z" />
        <path d="M10 8h4M10 12h4M10 16h4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
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

function MetricCard({ eyebrow, value, label, trend }) {
  return (
    <div className="rounded-2xl border border-[var(--fitco-border)] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a9aa6]">{eyebrow}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tracking-tight text-[#203245] md:text-4xl">{value}</p>
          <p className="mt-1 text-sm font-semibold text-[#5f7482]">{label}</p>
        </div>
        <span className="rounded-full bg-[#e8f7ea] px-3 py-1 text-xs font-semibold text-[#2d8f35]">{trend}</span>
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

function UserDetailsModal({ blocked, onClose }) {
  return (
    <ModalCard title="User Details" subtitle="See all details about John Doe" onClose={onClose}>
      <div className="mb-4 flex items-center gap-4">
        <div className="avatar">JD</div>
        <h3 className="text-3xl font-semibold text-[#46b14b] md:text-4xl">John Doe</h3>
      </div>
      <InfoRow k="Name" v="John Doe." />
      <InfoRow k="Email" v="john@email.com" />
      <InfoRow k="Phone" v="+12313412" />
      <InfoRow k="Joining Date" v="02-24-2024" />
      <div className="mt-7 grid gap-3 md:grid-cols-2">
        <button className="btn-outline" onClick={() => navigate(routes.users)}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => navigate(blocked ? routes.users : routes.blockConfirm)}>
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
