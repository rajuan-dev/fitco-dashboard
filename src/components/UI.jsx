export function Logo({ className = '' }) {
  return <h1 className={`text-5xl font-extrabold tracking-tight text-[var(--fitco-green)] md:text-7xl ${className}`}>FITCO</h1>
}

export function Field({ label, value, placeholder = '', type = 'text', readOnly = false, onChange }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-[#34475a] md:text-base">{label}</span> : null}
      <input className="field" value={value} placeholder={placeholder} type={type} readOnly={readOnly} onChange={onChange} />
    </label>
  )
}

export function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-[var(--fitco-border)] bg-gradient-to-b from-white to-[#fbfefb] p-5 text-center">
      <h3 className="text-4xl font-bold tracking-tight text-[#203245] md:text-5xl">{value}</h3>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-[#667a87] md:text-sm">{label}</p>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="rounded-2xl border border-[var(--fitco-border)] bg-[#f8fbf8] p-6 text-sm text-[#5c707e]">
      Loading data...
    </div>
  )
}

export function ModalCard({ title, subtitle, children, centerTitle = false, max = 'max-w-3xl' }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-[1.5px]">
      <div className={`w-full ${max} rounded-3xl bg-white p-5 shadow-2xl md:p-8`}>
        <h3 className={`text-3xl font-bold tracking-tight text-[var(--fitco-green)] md:text-5xl ${centerTitle ? 'text-center text-[#142032]' : ''}`}>
          {title}
        </h3>
        {subtitle ? <p className="mb-5 mt-2 text-center text-sm text-[#67757e] md:text-lg">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  )
}

export function InfoRow({ k, v }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#edf2ee] py-2.5 text-sm md:text-lg">
      <dt className="font-semibold text-[#253647]">{k}</dt>
      <dd className="text-right text-[#283746]">{v}</dd>
    </div>
  )
}

export function OtpBoxes() {
  return (
    <div className="flex gap-3 md:gap-4">
      {['8', '0', '-', '-'].map((v, i) => (
        <div key={`${v}-${i}`} className="otp-box">
          {v}
        </div>
      ))}
    </div>
  )
}
