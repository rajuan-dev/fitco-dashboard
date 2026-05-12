import { UsersTable } from '../../../components/Tables'
import { PageLoader, StatCard } from '../../../components/UI'
import { ListHeader, PaginationBar } from '../shared/TableControls'

export default function UsersPage({
  loading,
  rows,
  page,
  pageSize,
  totalItems,
  blocked = false,
  summary,
  toggleButtonText,
  onTogglePage,
  onViewUser,
  onToggleBlock,
  onPageChange,
}) {
  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard value={summary?.newUsersToday ?? 0} label="New Users Today" />
        <StatCard value={summary?.newUsersThisMonth ?? 0} label="New Users This Month" />
        <StatCard value={summary?.totalUsers ?? 0} label="Total Users" />
      </div>
      <ListHeader buttonText={toggleButtonText} onButtonClick={onTogglePage} />
      <UsersTable
        rows={rows}
        blocked={blocked}
        onView={onViewUser}
        onToggleBlock={onToggleBlock}
        hideFooter
        serialStart={(page - 1) * pageSize + 1}
      />
      <PaginationBar currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  )
}
