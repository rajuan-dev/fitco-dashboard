import { UsersTable } from '../../../components/Tables'
import { PageLoader } from '../../../components/UI'
import { ListHeader, PaginationBar } from '../shared/TableControls'

export default function UsersPage({
  loading,
  rows,
  page,
  pageSize,
  totalItems,
  blocked = false,
  toggleButtonText,
  onTogglePage,
  onViewUser,
  onToggleBlock,
  onPageChange,
}) {
  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
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
