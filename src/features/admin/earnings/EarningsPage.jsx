import { BasicTable } from '../../../components/Tables'
import { PageLoader, StatCard } from '../../../components/UI'
import { PaginationBar } from '../shared/TableControls'

export default function EarningsPage({ loading, earningsData, transactions, page, pageSize, totalItems, onPageChange, onViewTransaction }) {
  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#cfe2d2] bg-gradient-to-r from-[#edf8ee] via-[#f6fbf6] to-[#ecf6ff] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d7b67]">Revenue Overview</p>
        <p className="mt-1 text-sm text-[#476054]">Track income trends and inspect each transaction from one view.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard value={earningsData.today} label="Today" />
        <StatCard value={earningsData.thisMonth} label="This Month" />
        <StatCard value={earningsData.totalRevenue} label="Total Revenue" />
      </div>
      <BasicTable
        variant="earnings"
        headers={['S.ID', 'Full Name', 'Trx ID', 'Plans', 'Price', 'Date', 'Action']}
        avatarColumnIndex={1}
        rows={transactions.map((t) => [
          t.id,
          t.name,
          t.trxId,
          <span key={`plan-${t.id}`} className="inline-flex rounded-full bg-[#e9f6eb] px-2.5 py-1 text-xs font-semibold text-[#2f8f37]">
            {t.plan}
          </span>,
          <span key={`price-${t.id}`} className="font-semibold text-[#2f8850]">
            {t.price}
          </span>,
          <span key={`date-${t.id}`} className="text-[#4d6370]">
            {t.date}
          </span>,
          <button
            key={`trx-${t.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#cde6cf] bg-[#f5fcf6] px-2.5 py-1.5 text-xs font-semibold text-[var(--fitco-green)] transition hover:border-[#9ed6a2] hover:bg-[#eaf8ec]"
            onClick={() => onViewTransaction(t)}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1.5 12s4-6 10.5-6 10.5 6 10.5 6-4 6-10.5 6S1.5 12 1.5 12z" />
              <circle cx="12" cy="12" r="2.8" />
            </svg>
            View
          </button>,
        ])}
      />
      <PaginationBar currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  )
}
