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
  onManageFees,
  onUpdateStatus,
  updatingId,
  searchQuery = '',
  onSearchChange,
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
        <button onClick={onManageFees} className="btn-primary w-auto px-5">
          Manage Fees
        </button>
      </div>
      <BasicTable
        variant="subscriptions"
        headers={['S.ID', 'User', 'Email', 'Status', 'Plans', 'Expiration Date', 'Action']}
        avatarColumnIndex={1}
        serialStart={(page - 1) * pageSize + 1}
        rows={subscriptions.map((s) => [
          s.id,
          s.name,
          s.email,
          <span
            key={`status-${s.id}`}
            className={
          s.status === 'Paid'
            ? 'inline-flex min-w-[80px] justify-center rounded-full bg-[#e8f7ea] px-2.5 py-1 text-xs font-semibold text-[#2d8f35]'
            : 'inline-flex min-w-[80px] justify-center rounded-full bg-[#ffecec] px-2.5 py-1 text-xs font-semibold text-[#d94f4f]'
            }
          >
            {s.status}
          </span>,
          <span key={`plan-sub-${s.id}`} className="font-medium text-[#2f8850]">
            {s.plan}
          </span>,
          <span key={`expiry-${s.id}`} className="text-[#4d6370]">
            {s.expirationDate}
          </span>,
          <button
            key={`action-${s.id}`}
            className={`inline-flex min-w-[120px] items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              s.status === 'Paid' ? 'bg-[#ffecec] text-[#d94f4f] hover:bg-[#ffd9d9]' : 'bg-[#e8f7ea] text-[#2d8f35] hover:bg-[#d0f0d3]'
            } ${updatingId === s.id || updatingId === s.userId ? 'opacity-70 cursor-not-allowed' : ''}`}
            type="button"
            disabled={updatingId === s.id || updatingId === s.userId}
            onClick={() =>
              onUpdateStatus?.({
                subscriptionId: s.hasSubscription ? s.id : null,
                userId: s.userId,
                nextStatus: s.status === 'Paid' ? 'free' : 'paid',
                hasSubscription: Boolean(s.hasSubscription),
              })
            }
          >
            {updatingId === s.id || updatingId === s.userId ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating…
              </span>
            ) : s.status === 'Paid' ? (
              'Mark Free'
            ) : (
              'Mark Paid'
            )}
          </button>,
        ])}
      />
      <PaginationBar currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  )
}
