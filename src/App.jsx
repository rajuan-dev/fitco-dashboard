import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminLayout } from './components/AdminLayout'
import { BasicTable, UsersTable } from './components/Tables'
import { Field, InfoRow, Logo, ModalCard, OtpBoxes, PageLoader, StatCard } from './components/UI'
import { defaultRoute, routes } from './config/routes'
import { useAsyncData } from './hooks/useAsyncData'
import { navigate, useRouter } from './hooks/useRouter'
import { api } from './services/api'
import { clearToken, isAuthenticated, setToken } from './services/auth'

const isAuthRoute = (path) => path.startsWith('/auth')
const isAdminRoute = (path) => path.startsWith('/admin')

function App() {
  const { path } = useRouter()
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())

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
    <main className="app-bg min-h-screen p-4 md:p-6">
      {isAuthRoute(path) ? <AuthRoutes onAuthSuccess={() => setAuthenticated(true)} /> : null}
      {isAdminRoute(path) ? <AdminRoutes path={path} onLogout={() => setAuthenticated(false)} /> : null}
      {!isAuthRoute(path) && !isAdminRoute(path) && path !== '/' ? <UnknownRoute /> : null}
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
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#45b14a]" />
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

function AdminRoutes({ path, onLogout }) {
  const loadDashboard = useCallback(() => api.getDashboard(), [])
  const loadUsers = useCallback(() => api.getUsers(), [])
  const loadBlockedUsers = useCallback(() => api.getBlockedUsers(), [])
  const loadEarnings = useCallback(() => api.getEarnings(), [])
  const loadTransactions = useCallback(() => api.getTransactions(), [])
  const loadSubscriptions = useCallback(() => api.getSubscriptions(), [])
  const loadReports = useCallback(() => api.getReports(), [])
  const loadProfile = useCallback(() => api.getProfile(), [])

  const { data: dashboardData, loading: dashboardLoading } = useAsyncData(loadDashboard, {})
  const { data: users, loading: usersLoading } = useAsyncData(loadUsers, [])
  const { data: blockedUsers, loading: blockedUsersLoading } = useAsyncData(loadBlockedUsers, [])
  const { data: earningsData, loading: earningsLoading } = useAsyncData(loadEarnings, {})
  const { data: transactions, loading: transactionsLoading } = useAsyncData(loadTransactions, [])
  const { data: subscriptions, loading: subscriptionsLoading } = useAsyncData(loadSubscriptions, [])
  const { data: reports, loading: reportsLoading } = useAsyncData(loadReports, [])
  const { data: profile, loading: profileLoading } = useAsyncData(loadProfile, {})

  const handleLogout = useCallback(() => {
    clearToken()
    onLogout()
    navigate(routes.login)
  }, [onLogout])

  const page = (
    <>
      {path === routes.dashboard && (dashboardLoading ? <PageLoader /> : <DashboardPage data={dashboardData} users={users} />)}

      {path === routes.users &&
        (usersLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-4">
            <ListHeader buttonText="Blocked Users" onButtonClick={() => navigate(routes.blockedUsers)} />
            <UsersTable rows={users} onView={() => navigate(routes.userDetails)} onToggleBlock={() => navigate(routes.blockConfirm)} />
          </div>
        ))}

      {path === routes.blockedUsers &&
        (blockedUsersLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-4">
            <ListHeader buttonText="Active Users" onButtonClick={() => navigate(routes.users)} />
            <UsersTable rows={blockedUsers} blocked onView={() => navigate(routes.userDetails)} onToggleBlock={() => navigate(routes.userDetails)} />
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
              rows={transactions.map((t) => [
                t.id,
                t.name,
                t.trxId,
                t.plan,
                t.price,
                t.date,
                <button key={`trx-${t.id}`} className="text-[#47b24c]" onClick={() => navigate(routes.transaction)}>
                  ◉
                </button>,
              ])}
            />
          </div>
        ))}

      {path === routes.subscriptions &&
        (subscriptionsLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input className="field max-w-[380px]" placeholder="Search User" />
              <button onClick={() => navigate(routes.manageFees)} className="rounded-md bg-[#47b24c] px-5 py-2.5 font-semibold text-white">
                Manages Fees
              </button>
            </div>
            <BasicTable
              headers={['S.ID', 'User', 'Email', 'Status', 'Plans', 'Expiration Date']}
              rows={subscriptions.map((s) => [
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
          </div>
        ))}

      {path === routes.reports &&
        (reportsLoading ? <PageLoader /> : <BasicTable headers={['S.ID', 'Report From', 'Email', 'Report Reason', 'Date & Time']} rows={reports.map((r) => [r.id, r.name, r.email, r.reason, r.reportedAt])} />)}

      {path === routes.profile &&
        (profileLoading ? (
          <PageLoader />
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="grid place-items-center">
              <div className="avatar">MA</div>
              <h3 className="mt-3 text-3xl font-bold text-[#2a3946] md:text-[42px]">{profile.name}</h3>
              <div className="mt-2 flex gap-6 text-lg">
                <button className="font-semibold text-[#47b24c] underline">Edit Profile</button>
                <button className="text-[#7a8c90]" onClick={() => navigate(routes.changePassword)}>
                  Change Password
                </button>
              </div>
            </div>
            <Field label="User Name" value={profile.username} readOnly />
            <Field label="Email" value={profile.email} readOnly />
            <Field label="Contact No" value={profile.contactNo} readOnly />
            <button className="btn-primary">Update Profile</button>
          </div>
        ))}

      {path === routes.settings && (
        <div className="divide-y divide-[#dde6df]">
          <SettingRow label="Change Password" onClick={() => navigate(routes.changePassword)} />
          <SettingRow label="Privacy Policy" onClick={() => navigate(routes.privacy)} />
          <SettingRow label="Terms & Conditions" onClick={() => navigate(routes.terms)} />
          <SettingRow label="About Us" onClick={() => navigate(routes.about)} />
        </div>
      )}

      {path === routes.changePassword && (
        <div className="mx-auto max-w-2xl space-y-4">
          <Field label="Current Password" value="********" readOnly />
          <Field label="New Password" value="********" readOnly />
          <Field label="Confirm New Password" value="********" readOnly />
          <div className="text-right">
            <button className="text-[#77a67a] underline" onClick={() => navigate(routes.settingsForgot)}>
              Forgot password?
            </button>
          </div>
          <button className="btn-primary">Change Password</button>
        </div>
      )}

      {path === routes.settingsForgot && (
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="text-2xl text-[#2e3d4d]">Enter your email address to get a verification code for resetting your password.</p>
          <Field label="Email" value="Enter your email" readOnly />
          <button className="btn-primary" onClick={() => navigate(routes.settingsOtp)}>
            Get OTP
          </button>
        </div>
      )}

      {path === routes.settingsOtp && (
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="text-2xl text-[#2e3d4d]">Please check your email. We have sent a code to contact@gmail.com</p>
          <OtpBoxes />
          <div className="flex justify-between text-[#67757e]">
            <span>Didn't receive code?</span>
            <button className="underline">Resend</button>
          </div>
          <button className="btn-primary" onClick={() => navigate(routes.changePassword)}>
            Verify
          </button>
        </div>
      )}

      {[routes.privacy, routes.about, routes.terms].includes(path) ? <ArticleEditor /> : null}
    </>
  )

  return (
    <>
      <AdminLayout path={path}>{page}</AdminLayout>
      {path === routes.userDetails ? <UserDetailsModal blocked={false} /> : null}
      {path === routes.blockConfirm ? <ConfirmModal title="Do you want to Block this user?" onConfirm={() => navigate(routes.blockedUsers)} onCancel={() => navigate(routes.users)} /> : null}
      {path === routes.transaction ? <TransactionModal /> : null}
      {path === routes.manageFees ? <ManageFeesModal /> : null}
      {path === routes.logoutConfirm ? <ConfirmModal title="Confirm logging out!" onConfirm={handleLogout} onCancel={() => navigate(routes.dashboard)} /> : null}
    </>
  )
}

function DashboardPage({ data, users }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard value={data.totalUsers} label="Total User" />
        <StatCard value={data.totalRevenue} label="Total Revenue" />
      </div>

      <section className="rounded-2xl border border-[#e0e8e2] bg-[#fbfefb] p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold tracking-tight text-[#2f3f4f] md:text-4xl">User Ratio</h3>
          <button className="rounded-xl bg-[var(--fitco-green)] px-4 py-2 text-xs font-semibold text-white md:text-sm">Year-2024</button>
        </div>
        <div className="grid grid-cols-12 items-end gap-2 rounded-xl border border-[#e7efe8] bg-white p-3 md:gap-3 md:p-4">
          {data.userRatio?.map((height, i) => (
            <div key={`dbar-${i}`} className="flex flex-col items-center gap-2">
              <div
                className="w-3 rounded-full bg-[var(--fitco-green)] shadow-[0_2px_8px_rgba(65,177,73,0.24)] md:w-4"
                style={{ height: `${Math.max(36, Math.round(height / 10))}px` }}
              />
              <span className="text-xs text-[#70808d]">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
            </div>
          ))}
        </div>
      </section>

      <UsersTable rows={users.slice(0, 8)} onView={() => navigate(routes.userDetails)} onToggleBlock={() => navigate(routes.blockConfirm)} title="Recent Users" />
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
      <button onClick={onButtonClick} className="rounded-xl bg-[var(--fitco-green)] px-5 py-2.5 text-sm font-semibold text-white md:text-base">
        {buttonText}
      </button>
    </div>
  )
}

function SettingRow({ label, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between py-4 text-left text-lg text-[#2e3d4d] transition hover:text-[#47b24c] md:text-2xl">
      <span>{label}</span>
      <span>›</span>
    </button>
  )
}

function ArticleEditor() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[#424f5b] md:text-base">
      <p>Iacus nulla eu netus pretium. Pellentesque scelerisque tellus nisl eu nisl sed senectus nunc. Porta sollicitudin vel elit varius nulla sit diam sed.</p>
      <p>Diam pellentesque orci eget gravida cursus. Ut ut nulla sapien eget vitae at eget pretium. Tristique nibh ipsum iaculis quam. Vestibulum magna cursus facilisis adipiscing cras dui.</p>
      <p>Ut suscipit cursus id mauris. Accumsan egestas sit arcu sed. Feugiat tortor pharetra id ipsum elit diam viverra tortor. Mattis tincidunt eget ut nunc in.</p>
    </div>
  )
}

function UserDetailsModal({ blocked }) {
  return (
    <ModalCard title="User Details" subtitle="See all details about John Doe">
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

function TransactionModal() {
  return (
    <ModalCard title="Transaction Details">
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

function ManageFeesModal() {
  return (
    <ModalCard title="Manage Fees" max="max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 md:border-r md:border-[#cde2cf] md:pr-6">
          <h4 className="text-2xl font-semibold text-[#2e3d4d]">Subscriptions Fees</h4>
          <div className="rounded-xl border border-[#dfe8e1] p-4">
            <p className="mb-2 text-lg">Premium monthly plan: $9.99</p>
            <input className="field" value="PREMIUM50" readOnly />
          </div>
          <div className="rounded-xl border border-[#dfe8e1] p-4">
            <p className="mb-2 text-lg">Premium Yearly Plan:</p>
            <input className="field" value="PREMIUM50" readOnly />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold text-[#2e3d4d]">Coupons</h4>
          <div className="rounded-xl border border-[#dfe8e1] p-4">
            <p className="mb-2 text-lg">Coupon Code</p>
            <input className="field" value="PREMIUM50" readOnly />
            <p className="my-3 text-lg">Discount Value</p>
            <div className="flex items-center gap-4 text-lg">
              <span className="grid h-8 w-8 place-content-center rounded-full bg-[#efefef]">-</span>
              <span>10%</span>
              <span className="grid h-8 w-8 place-content-center rounded-full bg-[#d7f0d8] text-[#44b249]">+</span>
            </div>
          </div>
          <button className="btn-primary">+ Add New Coupon</button>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <button className="btn-outline" onClick={() => navigate(routes.subscriptions)}>
          Update fee
        </button>
        <button className="btn-primary" onClick={() => navigate(routes.subscriptions)}>
          Reset to default
        </button>
      </div>
    </ModalCard>
  )
}

function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <ModalCard title={title} subtitle="" centerTitle>
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
