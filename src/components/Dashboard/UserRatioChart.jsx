import { useMemo, useState } from 'react'

const roundUpHundred = (value) => {
  if (!Number.isFinite(value) || value <= 0) return 100
  return Math.ceil((value + 50) / 100) * 100
}

const CustomTooltip = ({ month, value }) => {
  return (
    <div className="rounded-xl border border-[#d9e8dc] bg-white px-3 py-2 shadow-[0_10px_20px_rgba(28,44,36,0.12)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d909a]">{month}</p>
      <p className="text-sm font-bold text-[#2f9b38]">{Number(value || 0).toLocaleString()} users</p>
    </div>
  )
}

export default function UserRatioChart({ data = [], selectedYear, onYearChange, yearOptions = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data])
  const maxUsers = Math.max(...chartData.map((item) => Number(item.users || item.value || 0)), 0)
  const yAxisMax = roundUpHundred(maxUsers)

  const effectiveYear = selectedYear || String(new Date().getFullYear())
  const effectiveOptions = Array.isArray(yearOptions) && yearOptions.length > 0 ? yearOptions : [effectiveYear]

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((step) => Math.round(yAxisMax * step)).reverse()

  return (
    <section className="rounded-2xl border border-[var(--fitco-border)] bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a9aa6]">Engagement</p>
          <h2 className="text-xl font-semibold text-[#223343] md:text-2xl">User Ratio</h2>
          <p className="text-sm text-[#718391]">Unique sessions recorded each month.</p>
        </div>

        <div className="w-full max-w-[180px] text-sm">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a9aa6]">Reporting Range</label>
          <select
            value={effectiveYear}
            onChange={(event) => onYearChange?.(event.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[#d7e2d9] bg-[#f8fbf8] px-3 text-sm font-medium text-[#415664] outline-none focus:border-[#81c987]"
          >
            {effectiveOptions.map((year) => (
              <option key={year} value={year}>{`Year-${year}`}</option>
            ))}
          </select>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="mt-6 rounded-xl border border-[#e7efe8] bg-[#fbfefb] p-3 md:p-4">
          <div className="grid grid-cols-[42px_1fr] gap-3">
            <div className="relative h-[250px]">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-medium text-[#90a0ab]">
                {ticks.map((tick) => (
                  <span key={tick}>{tick.toLocaleString()}</span>
                ))}
              </div>
            </div>

            <div className="relative h-[250px]">
              <div className="absolute inset-0 flex flex-col justify-between">
                {ticks.map((tick) => (
                  <div key={`line-${tick}`} className="border-t border-dashed border-[#e6eeea]" />
                ))}
              </div>

              <div className="absolute inset-0 grid grid-cols-12 items-end gap-2 md:gap-3">
                {chartData.map((item, index) => {
                  const users = Number(item.users || item.value || 0)
                  const monthLabel = item.month || item.label || `M${index + 1}`
                  const heightPercent = Math.max(10, (users / yAxisMax) * 100)
                  const isActive = hoveredIndex === index

                  return (
                    <div
                      key={`${monthLabel}-${index}`}
                      className="relative flex h-full cursor-pointer flex-col items-center justify-end"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onFocus={() => setHoveredIndex(index)}
                      onBlur={() => setHoveredIndex(null)}
                      tabIndex={0}
                    >
                      {isActive ? (
                        <div className="absolute inset-y-0 w-10 rounded-full bg-[#edf8ee]" />
                      ) : null}

                      {isActive ? (
                        <div className="absolute -top-16 left-1/2 z-10 -translate-x-1/2">
                          <CustomTooltip month={monthLabel} value={users} />
                        </div>
                      ) : null}

                      <div
                        className={`z-[1] w-6 rounded-[12px] transition-all duration-200 md:w-7 ${
                          isActive ? 'bg-[#2f9b38] shadow-[0_10px_20px_rgba(47,155,56,0.34)] -translate-y-0.5' : 'bg-[var(--fitco-green)] shadow-[0_5px_12px_rgba(65,177,73,0.2)]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="mt-2 text-[10px] font-medium text-[#70808d] md:text-xs">{monthLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-[var(--fitco-border)] bg-[#f8fbf8] p-6 text-sm text-[#5c707e]">No analytics data available.</div>
      )}
    </section>
  )
}
