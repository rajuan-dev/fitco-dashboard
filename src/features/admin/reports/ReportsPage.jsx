import { BasicTable } from '../../../components/Tables'
import { PageLoader } from '../../../components/UI'
import { PaginationBar } from '../shared/TableControls'

export default function ReportsPage({ loading, reports, page, pageSize, totalItems, onPageChange, onReportAction }) {
  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#ecdccf] bg-gradient-to-r from-[#fff6ea] via-[#fffaf1] to-[#f4fbf6] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a36534]">User Reports</p>
        <p className="mt-1 text-sm text-[#6f6257]">Review submitted concerns with sender, reason, and report time.</p>
      </div>
      <BasicTable
        variant="reports"
        headers={['S.ID', 'Report From', 'Email', 'Issue Type', 'Description', 'Status', 'Date & Time', 'Action']}
        avatarColumnIndex={1}
        serialStart={(page - 1) * pageSize + 1}
        rows={reports.map((r) => [
          r.id,
          r.name,
          <span key={`email-${r.id}`} className="text-[#465d70]">
            {r.email || '-'}
          </span>,
          <span key={`reason-${r.id}`} className="inline-flex whitespace-nowrap rounded-full bg-[#fff0e0] px-2.5 py-1 text-xs font-semibold text-[#b06833]">
            {String(r.reason || '-').replaceAll('_', ' ')}
          </span>,
          <p key={`desc-${r.id}`} className="max-w-[440px] whitespace-normal break-words leading-5 text-[#465d70]">
            {r.description || '-'}
          </p>,
          <span
            key={`status-${r.id}`}
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              r.status === 'resolved'
                ? 'bg-[#e8f7eb] text-[#2f9b38]'
                : r.status === 'in_progress'
                  ? 'bg-[#fff6dd] text-[#a16a2d]'
                  : 'bg-[#f2f6fc] text-[#4f6785]'
            }`}
          >
            {String(r.status || 'open').replaceAll('_', ' ')}
          </span>,
          <span key={`date-r-${r.id}`} className="inline-flex whitespace-nowrap rounded-full bg-[#f2f6fc] px-2.5 py-1 text-xs font-semibold text-[#4f6785]">
            {r.reportedAt}
          </span>,
          <div key={`action-r-${r.id}`} className="flex flex-wrap items-center gap-1.5 whitespace-nowrap">
            <button
              className="rounded-md border border-[#eecf99] bg-[#fff4df] px-2.5 py-1 text-xs font-semibold text-[#a16a2d] transition hover:bg-[#ffe9c7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onReportAction('warn', r)}
              disabled={r.status === 'resolved'}
            >
              Warn
            </button>
            <button
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                r.isBlocked
                  ? 'border border-[#cde6cf] bg-[#f2fbf3] text-[#2f9b38] hover:bg-[#e4f5e6]'
                  : 'border border-[#f2c2c2] bg-[#ffeded] text-[#cc4d4d] hover:bg-[#ffdede]'
              }`}
              onClick={() => onReportAction('toggle_block', r)}
              disabled={r.status === 'resolved'}
            >
              {r.isBlocked ? 'Enable' : 'Disable'}
            </button>
            <button
              className="rounded-md border border-[#bfd7ee] bg-[#ebf5ff] px-2.5 py-1 text-xs font-semibold text-[#2f6fb0] transition hover:bg-[#ddecff] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onReportAction('resolve', r)}
              disabled={r.status === 'resolved'}
            >
              {r.status === 'resolved' ? 'Resolved' : 'Resolve'}
            </button>
          </div>,
        ])}
      />
      <PaginationBar currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  )
}
