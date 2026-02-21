import { useState } from 'react'
import { Logo } from './UI'
import { routes } from '../config/routes'
import { navigate } from '../hooks/useRouter'

const navItems = [
  { path: routes.dashboard, label: 'Dashboard', icon: 'dashboard' },
  { path: routes.users, label: 'Users', icon: 'users' },
  { path: routes.earnings, label: 'Earnings', icon: 'chart' },
  { path: routes.subscriptions, label: 'Subscriptions', icon: 'crown' },
  { path: routes.reports, label: 'Report', icon: 'alert' },
  { path: routes.settings, label: 'Settings', icon: 'settings' },
]

const titles = {
  [routes.dashboard]: 'Dashboard Overview',
  [routes.users]: 'User List',
  [routes.blockedUsers]: 'Blocked Users',
  [routes.earnings]: 'Earnings',
  [routes.subscriptions]: 'Subscriptions',
  [routes.reports]: 'Reports',
  [routes.profile]: 'Profile',
  [routes.settings]: 'Settings',
  [routes.changePassword]: 'Change Password',
  [routes.settingsForgot]: 'Forgot Password',
  [routes.settingsOtp]: 'OTP Verification',
  [routes.privacy]: 'Privacy Policy',
  [routes.about]: 'About Us',
  [routes.terms]: 'Terms & Conditions',
}

const backArrowPages = new Set([
  routes.users,
  routes.blockedUsers,
  routes.earnings,
  routes.subscriptions,
  routes.reports,
  routes.profile,
  routes.settings,
  routes.changePassword,
  routes.settingsForgot,
  routes.settingsOtp,
  routes.privacy,
  routes.about,
  routes.terms,
])

function Icon({ type, className = '' }) {
  const base = `h-5 w-5 ${className}`

  if (type === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  }

  if (type === 'users') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M15 20c0-2.2 1.8-4 4-4" />
      </svg>
    )
  }

  if (type === 'chart') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="2.5" height="6" />
        <rect x="11.5" y="9" width="2.5" height="9" />
        <rect x="16" y="6" width="2.5" height="12" />
      </svg>
    )
  }

  if (type === 'crown') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8l4.5 4L12 6l4.5 6L21 8l-2 11H5L3 8z" />
      </svg>
    )
  }

  if (type === 'alert') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l10 18H2L12 3z" />
        <path d="M12 9v5" />
        <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'settings') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V23a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.8 15 1.7 1.7 0 0 0 3.2 14H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.2V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z" />
      </svg>
    )
  }

  if (type === 'menu') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function AdminLayout({ path, children }) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const title = titles[path] || 'Dashboard'
  const activeNav = path.startsWith('/admin/users')
    ? routes.users
    : path.startsWith('/admin/earnings')
      ? routes.earnings
      : path.startsWith('/admin/subscriptions')
        ? routes.subscriptions
        : path.startsWith('/admin/reports')
          ? routes.reports
          : path.startsWith('/admin/settings')
            ? routes.settings
            : path

  const onNavigate = (to) => {
    setIsNavOpen(false)
    navigate(to)
  }

  const getBackPath = () => {
    if (path === routes.blockedUsers) return routes.users
    if (path === routes.changePassword || path === routes.settingsForgot || path === routes.settingsOtp || path === routes.privacy || path === routes.about || path === routes.terms) {
      return routes.settings
    }
    if (path === routes.profile) return routes.settings
    if (path === routes.users || path === routes.earnings || path === routes.subscriptions || path === routes.reports || path === routes.settings) {
      return routes.dashboard
    }
    return routes.dashboard
  }

  return (
    <section className="w-full animate-fade-in">
      <div className="grid min-h-screen gap-4 p-3 md:p-4 lg:grid-cols-[280px_1fr]">
        {isNavOpen ? <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setIsNavOpen(false)} aria-label="Close menu" /> : null}

        <aside
          className={`fixed left-0 top-0 z-40 flex h-screen w-[84%] max-w-[320px] flex-col -translate-x-full rounded-r-2xl border-r border-[var(--fitco-border)] bg-white p-5 shadow-2xl transition-transform duration-200 lg:sticky lg:top-4 lg:h-[calc(100vh-32px)] lg:w-full lg:max-w-none lg:translate-x-0 lg:rounded-3xl lg:border ${isNavOpen ? 'translate-x-0' : ''}`}
        >
          <div className="rounded-2xl border border-[#e6efe7] bg-[#f8fcf9] p-4">
            <Logo className="text-left" />
          </div>

          <nav className="mt-5 flex flex-1 flex-col gap-1.5">
            {navItems.map((item) => (
              <button key={item.path} onClick={() => onNavigate(item.path)} className={`nav-item ${activeNav === item.path ? 'active' : ''}`}>
                <Icon type={item.icon} className="h-4 w-4 md:h-5 md:w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button className="nav-item mt-4 text-[#ef5a5a]" onClick={() => onNavigate(routes.logoutConfirm)}>
            <span className="text-lg">↪</span>
            <span>Logout</span>
          </button>
        </aside>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl border border-[var(--fitco-border)] bg-white px-4 py-3 shadow-sm md:px-6 md:py-4">
            <div className="flex items-center gap-3 md:gap-4">
              <button className="text-[var(--fitco-green)] lg:hidden" onClick={() => setIsNavOpen(true)} aria-label="Open menu">
                <Icon type="menu" className="h-6 w-6" />
              </button>
              <span className="hidden text-[var(--fitco-green)] lg:block">
                <Icon type="menu" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-[#223343] md:text-xl">Welcome, James</h3>
                <p className="text-xs text-[#748491] md:text-sm">Have a nice day!</p>
              </div>
            </div>
            <button
              onClick={() => navigate(routes.profile)}
              className="grid h-10 w-10 place-content-center rounded-full border border-[#93cc99] bg-[#f8fff8] text-sm font-semibold text-[var(--fitco-green)] md:h-12 md:w-12"
            >
              JA
            </button>
          </div>

          <article className="overflow-hidden rounded-3xl border border-[var(--fitco-border)] bg-white shadow-sm">
            <header className="flex items-center justify-between bg-[var(--fitco-green)] px-4 py-4 text-white md:px-6">
              <div className="flex items-center gap-3">
                {backArrowPages.has(path) ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(getBackPath())}
                    aria-label="Go back"
                    className="grid h-10 w-10 place-content-center rounded-full border border-white/45 bg-white/12 transition hover:bg-white/22"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                ) : null}
                <h2 className="text-xl font-bold tracking-tight md:text-3xl">{title}</h2>
              </div>
            </header>

            <div className="min-h-[560px] p-4 md:p-6">{children}</div>
          </article>
        </div>
      </div>
    </section>
  )
}
