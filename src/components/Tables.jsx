export function UsersTable({ rows, blocked = false, onView, onToggleBlock, title = '' }) {
  const headers = ['S.ID', 'Full Name', 'Email', 'Phone No', 'Joined Date', 'Action']

  return (
    <section>
      {title ? <h3 className="mb-2 text-3xl font-semibold text-[#2f3f4f]">{title}</h3> : null}
      <div className="table-wrap hidden md:block">
        <table className="min-w-[760px] w-full overflow-hidden rounded-xl text-left text-sm">
          <thead className="bg-[#47b24c] text-white">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.id}-${i}`} className="border-t border-[#edf2ee]">
                <td className="px-3 py-3">{row.id}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="avatar-sm">RF</div>
                    {row.name}
                  </div>
                </td>
                <td className="px-3 py-3">{row.email}</td>
                <td className="px-3 py-3">{row.phone}</td>
                <td className="px-3 py-3">{row.joinedDate || row.date}</td>
                <td className="px-3 py-3">
                  <button className="mr-3 text-[#ee5858]" onClick={onToggleBlock}>
                    {blocked ? '↻' : '⊘'}
                  </button>
                  <button className="text-[#47b24c]" onClick={onView}>
                    ◉
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <article key={`${row.id}-m-${i}`} className="rounded-xl border border-[#dfe8e1] bg-[#fbfdfb] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="avatar-sm">RF</div>
                <strong className="text-sm text-[#2f3f4f]">{row.name}</strong>
              </div>
              <span className="text-xs text-[#6f818d]">ID {row.id}</span>
            </div>
            <div className="space-y-1 text-xs text-[#5f717d]">
              <p>Email: {row.email}</p>
              <p>Phone: {row.phone}</p>
              <p>Joined: {row.joinedDate || row.date}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-md border border-[#71be76] px-3 py-2 text-sm font-semibold text-[#45b14a]" onClick={onView}>
                View
              </button>
              <button className="flex-1 rounded-md bg-[#f15959] px-3 py-2 text-sm font-semibold text-white" onClick={onToggleBlock}>
                {blocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[#72a575]">
        <span>SHOWING 1-8 OF 250</span>
        <span>1 2 3 4....30 60 120</span>
      </div>
    </section>
  )
}

export function BasicTable({ headers, rows }) {
  return (
    <>
      <div className="table-wrap hidden md:block">
        <table className="min-w-[760px] w-full overflow-hidden rounded-xl text-left text-sm">
          <thead className="bg-[#f9fbf9] text-[#5d7367]">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`r-${idx}`} className="border-t border-[#edf2ee]">
                {row.map((cell, i) => (
                  <td key={`c-${idx}-${i}`} className="px-3 py-3">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((row, idx) => (
          <article key={`mobile-row-${idx}`} className="rounded-xl border border-[#dfe8e1] bg-[#fbfdfb] p-4">
            {headers.map((header, i) => (
              <div key={`mobile-cell-${idx}-${i}`} className="flex justify-between gap-3 border-b border-[#edf2ee] py-2 text-xs last:border-b-0">
                <span className="font-semibold text-[#5d7367]">{header}</span>
                <span className="text-right text-[#2f3f4f]">{row[i]}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </>
  )
}
