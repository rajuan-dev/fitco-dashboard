import { useState } from 'react'
import { Logo } from './UI'
import { routes } from '../config/routes'
import { navigate } from '../hooks/useRouter'

const navItems = [
  { path: routes.dashboard, label: 'Dashboard' },
  { path: routes.users, label: 'Users' },
  { path: routes.earnings, label: 'Earnings' },
  { path: routes.subscriptions, label: 'Subscriptions' },
  { path: routes.reports, label: 'Report' },
  { path: routes.settings, label: 'Settings' },
]

const titles = {
  [routes.dashboard]: 'Dashboard',
  [routes.users]: 'User List',
  [routes.blockedUsers]: 'Blocked List',
  [routes.earnings]: 'Earnings',
  [routes.subscriptions]: 'Subscriptions',
  [routes.reports]: 'Reports',
  [routes.profile]: 'Profile',
  [routes.settings]: 'Settings',
  [routes.changePassword]: 'Change Password',
  [routes.settingsForgot]: 'Forgot Password',
  [routes.settingsOtp]: 'Settings',
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

export function AdminLayout({ path, children }) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const title = titles[path] || 'Dashboard'
  const showSave = [routes.privacy, routes.about, routes.terms].includes(path)
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

  return (
    <section className="mx-auto max-w-[1400px] animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row">
        {isNavOpen ? <button className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setIsNavOpen(false)} aria-label="Close menu" /> : null}

        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-[84%] max-w-[320px] -translate-x-full rounded-r-2xl border-r border-[#dfe8e1] bg-white p-5 shadow-xl transition-transform duration-200 lg:static lg:h-auto lg:w-[280px] lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-sm ${isNavOpen ? 'translate-x-0' : ''}`}
        >
          <Logo className="mb-6" />

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`nav-item ${activeNav === item.path ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button className="mt-8 nav-item text-[#f05b5b]" onClick={() => onNavigate(routes.logoutConfirm)}>
            Logout
          </button>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-[#dfe8e1] bg-white px-4 py-4 shadow-sm md:px-6">
            <div className="flex items-center gap-4">
              <button className="text-2xl text-[#47b24c] lg:hidden" onClick={() => setIsNavOpen(true)} aria-label="Open menu">
                ☰
              </button>
              <span className="hidden text-2xl text-[#47b24c] lg:block">☰</span>
              <div>
                <h3 className="text-lg font-bold text-[#283746] md:text-2xl">Welcome,James</h3>
                <p className="text-sm text-[#6d7f89]">Have a nice day!</p>
              </div>
            </div>
            <button onClick={() => navigate(routes.profile)} className="grid h-11 w-11 place-content-center rounded-full border border-[#87c98d] text-[#47b24c]">
              ⊙
            </button>
          </div>

          <article className="rounded-2xl border border-[#dfe8e1] bg-white shadow-sm">
            <header className="flex items-center justify-between rounded-t-2xl bg-[#47b24c] px-4 py-4 text-white md:px-6">
              <div className="flex items-center gap-3">
                {backArrowPages.has(path) ? <span className="text-lg leading-none">←</span> : null}
                <h2 className="text-2xl font-bold md:text-4xl">{title}</h2>
              </div>
              {showSave ? <button className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#4e9e50] md:px-6">Save</button> : null}
            </header>

            <div className="min-h-[560px] p-4 md:p-6">{children}</div>
          </article>
        </div>
      </div>
    </section>
  )
}
