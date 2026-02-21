export function PaginationBar({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalItems)
  const visiblePages = []
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - safePage) <= 1) {
      visiblePages.push(page)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[#6ea672] md:text-sm">
      <span>{`SHOWING ${start}-${end} OF ${totalItems}`}</span>
      <div className="flex items-center gap-1">
        <button className="rounded-md border border-[#cfe3d1] px-2 py-1 text-[#5f7783] disabled:opacity-50" onClick={() => onPageChange(safePage - 1)} disabled={safePage <= 1}>
          Prev
        </button>
        {visiblePages.map((page, index) => (
          <span key={page} className="inline-flex items-center">
            {index > 0 && page - visiblePages[index - 1] > 1 ? <span className="px-1 text-[#7f9790]">…</span> : null}
            <button
              className={`rounded-md border px-2 py-1 ${page === safePage ? 'border-[var(--fitco-green)] bg-[var(--fitco-green)] text-white' : 'border-[#cfe3d1] text-[#5f7783]'}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        ))}
        <button
          className="rounded-md border border-[#cfe3d1] px-2 py-1 text-[#5f7783] disabled:opacity-50"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function ListHeader({ buttonText, onButtonClick }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[260px] flex-1">
        <input className="field pl-10" placeholder="Search User" />
        <span className="absolute left-3 top-2.5 text-lg text-[#6a7f72]">⌕</span>
      </div>
      <button onClick={onButtonClick} className="btn-primary w-auto px-5">
        {buttonText}
      </button>
    </div>
  )
}

