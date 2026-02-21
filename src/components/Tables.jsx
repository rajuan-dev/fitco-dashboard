function RowActions({ blocked, onView, onToggleBlock }) {
  return (
    <div className="flex items-center gap-1">
      <button className="rounded-md px-2 py-1 text-xs font-semibold text-[#ea5656] transition hover:bg-[#ffefef]" onClick={onToggleBlock}>
        {blocked ? 'Unblock' : 'Block'}
      </button>
      <button className="rounded-md px-2 py-1 text-xs font-semibold text-[var(--fitco-green)] transition hover:bg-[#ecf8ed]" onClick={onView}>
        View
      </button>
    </div>
  )
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'NA'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
}

export function UsersTable({ rows, blocked = false, onView, onToggleBlock, title = '', hideFooter = false }) {
  const headers = ['S.ID', 'Full Name', 'Email', 'Phone No', 'Joined Date', 'Action']

  return (
    <section>
      {title ? <h3 className="mb-3 text-3xl font-bold tracking-tight text-[#223343] md:text-5xl">{title}</h3> : null}
      <div className="table-wrap hidden md:block">
        <table className="min-w-[780px] w-full text-left text-sm">
          <thead className="bg-[var(--fitco-green)] text-white">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.id}-${i}`} className="border-t border-[#edf2ee] transition hover:bg-[#f8fcf8]">
                <td className="px-3 py-3 font-medium text-[#5f7380]">{row.id}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="avatar-sm">{getInitials(row.name)}</div>
                    <span className="font-medium text-[#2d3f50]">{row.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-[#4f6471]">{row.email}</td>
                <td className="px-3 py-3 text-[#4f6471]">{row.phone}</td>
                <td className="px-3 py-3 text-[#4f6471]">{row.joinedDate || row.date}</td>
                <td className="px-3 py-3">
                  <RowActions blocked={blocked} onView={onView} onToggleBlock={onToggleBlock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <article key={`${row.id}-m-${i}`} className="rounded-2xl border border-[var(--fitco-border)] bg-[#fbfefb] p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="avatar-sm">{getInitials(row.name)}</div>
                <strong className="text-sm text-[#2f3f4f]">{row.name}</strong>
              </div>
              <span className="text-xs text-[#6f818d]">ID {row.id}</span>
            </div>
            <div className="space-y-1 text-xs text-[#5f717d]">
              <p>{row.email}</p>
              <p>{row.phone}</p>
              <p>{row.joinedDate || row.date}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-lg border border-[#82c987] px-3 py-2 text-sm font-semibold text-[var(--fitco-green)]" onClick={onView}>
                View
              </button>
              <button className="flex-1 rounded-lg bg-[#f15959] px-3 py-2 text-sm font-semibold text-white" onClick={onToggleBlock}>
                {blocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!hideFooter ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[#6ea672] md:text-sm">
          <span>SHOWING 1-8 OF 250</span>
          <span>1 2 3 4....30 60 120</span>
        </div>
      ) : null}
    </section>
  )
}

export function BasicTable({ headers, rows, avatarColumnIndex = null }) {
  return (
    <>
      <div className="table-wrap hidden md:block">
        <table className="min-w-[780px] w-full text-left text-sm">
          <thead className="bg-[#f8fcf8] text-[#5d7367]">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`r-${idx}`} className="border-t border-[#edf2ee] transition hover:bg-[#f8fcf8]">
                {row.map((cell, i) => (
                  <td key={`c-${idx}-${i}`} className="px-3 py-3 text-[#3f5663]">
                    {avatarColumnIndex === i && typeof cell === 'string' ? (
                      <div className="flex items-center gap-3">
                        <div className="avatar-sm">{getInitials(cell)}</div>
                        <span className="font-medium text-[#2d3f50]">{cell}</span>
                      </div>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row, idx) => (
          <article key={`mobile-row-${idx}`} className="rounded-2xl border border-[var(--fitco-border)] bg-[#fbfefb] p-4 shadow-sm">
            {headers.map((header, i) => (
              <div key={`mobile-cell-${idx}-${i}`} className="flex justify-between gap-3 border-b border-[#edf2ee] py-2 text-xs last:border-b-0">
                <span className="font-semibold text-[#5d7367]">{header}</span>
                <span className="text-right text-[#2f3f4f]">
                  {avatarColumnIndex === i && typeof row[i] === 'string' ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="avatar-sm">{getInitials(row[i])}</span>
                      <span>{row[i]}</span>
                    </span>
                  ) : (
                    row[i]
                  )}
                </span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </>
  )
}
