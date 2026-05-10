import { useMemo } from 'react'
import { UsersTable } from '../../../components/Tables'
import UserRatioChart from './components/UserRatioChart'

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

export default function DashboardPage({ data, users, selectedYear, onYearChange, onViewUser, onBlockUser }) {
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, index) => String(currentYear - index))
  }, [])
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

      <UserRatioChart data={chartData} selectedYear={selectedYear} onYearChange={onYearChange} yearOptions={yearOptions} />

      <UsersTable rows={users.slice(0, 8)} onView={onViewUser} onToggleBlock={onBlockUser} title="Recent Users" hideFooter />
    </div>
  )
}

