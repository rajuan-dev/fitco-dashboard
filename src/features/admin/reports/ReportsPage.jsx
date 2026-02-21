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
        headers={['S.ID', 'Report From', 'Email', 'Report Reason', 'Date & Time', 'Action']}
        avatarColumnIndex={1}
        serialStart={(page - 1) * pageSize + 1}
        rows={reports.map((r) => [
          r.id,
          r.name,
          <span key={`email-${r.id}`} className="text-[#465d70]">
            {r.email}
          </span>,
          <span key={`reason-${r.id}`} className="inline-flex rounded-full bg-[#fff0e0] px-2.5 py-1 text-xs font-semibold text-[#b06833]">
            {r.reason}
          </span>,
          <span key={`date-r-${r.id}`} className="inline-flex rounded-full bg-[#f2f6fc] px-2.5 py-1 text-xs font-semibold text-[#4f6785]">
            {r.reportedAt}
          </span>,
          <div key={`action-r-${r.id}`} className="flex flex-wrap gap-1.5">
            <button
              className="rounded-md border border-[#eecf99] bg-[#fff4df] px-2.5 py-1 text-xs font-semibold text-[#a16a2d] transition hover:bg-[#ffe9c7]"
              onClick={() => onReportAction('warn', r)}
            >
              Warn
            </button>
            <button
              className="rounded-md border border-[#f2c2c2] bg-[#ffeded] px-2.5 py-1 text-xs font-semibold text-[#cc4d4d] transition hover:bg-[#ffdede]"
              onClick={() => onReportAction('disable', r)}
            >
              Disable
            </button>
            <button
              className="rounded-md border border-[#cde6cf] bg-[#f2fbf3] px-2.5 py-1 text-xs font-semibold text-[#2f9b38] transition hover:bg-[#e4f5e6]"
              onClick={() => onReportAction('restore', r)}
            >
              Restore Access
            </button>
          </div>,
        ])}
      />
      <PaginationBar currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  )
}
