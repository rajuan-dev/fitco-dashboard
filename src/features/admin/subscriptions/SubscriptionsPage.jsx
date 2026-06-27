import { BasicTable } from '../../../components/Tables'
import { PageLoader } from '../../../components/UI'
import { PaginationBar } from '../shared/TableControls'

export default function SubscriptionsPage({
  loading,
  subscriptions,
  page,
  pageSize,
  totalItems,
  onPageChange,
  searchQuery = '',
  onSearchChange,
  onManageDiscounts,
}) {
  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#cfe2d2] bg-gradient-to-r from-[#edf8ee] via-[#f6fbf6] to-[#ecf6ff] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d7b67]">Membership Status</p>
        <p className="mt-1 text-sm text-[#4e627d]">Monitor active plans, renewals, and subscription outcomes.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="field max-w-[380px] border-[#cde6cf] bg-[#f7fcf7] focus:border-[#81c987] focus:ring-[#d6edd8]"
          placeholder="Search by name or email"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
        <button className="btn-primary w-auto px-5" onClick={onManageDiscounts}>
          Manage Subscription
        </button>
      </div>
      <BasicTable
        variant="subscriptions"
        headers={['S.ID', 'User', 'Email', 'Store', 'Status', 'Plan', 'Expiration Date']}
        avatarColumnIndex={1}
        serialStart={(page - 1) * pageSize + 1}
        rows={subscriptions.map((s) => [
          s.id,
          s.name,
          s.email,
          <span key={`platform-${s.id}`} className="inline-flex rounded-full bg-[#eef7ef] px-2.5 py-1 text-xs font-semibold capitalize text-[#2f8f37]">
            {s.platform || '-'}
          </span>,
          <span
            key={`status-${s.id}`}
            className={
              s.status === 'active'
                ? 'inline-flex min-w-[80px] justify-center rounded-full bg-[#e8f7ea] px-2.5 py-1 text-xs font-semibold text-[#2d8f35]'
                : 'inline-flex min-w-[80px] justify-center rounded-full bg-[#fff2e5] px-2.5 py-1 text-xs font-semibold text-[#bf6a1a]'
            }
          >
            {s.statusLabel}
          </span>,
          <span key={`plan-sub-${s.id}`} className="font-medium text-[#2f8850]">
            {s.plan}
          </span>,
          <span key={`expiry-${s.id}`} className="text-[#4d6370]">
            {s.expirationDate}
          </span>,
        ])}
      />
      <PaginationBar currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  )
}
