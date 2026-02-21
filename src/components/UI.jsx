export function Logo({ className = '' }) {
  return <h1 className={`text-6xl font-extrabold tracking-wide text-[#45b14a] ${className}`}>FITCO</h1>
}

export function Field({
  label,
  value,
  placeholder = '',
  type = 'text',
  readOnly = false,
  onChange,
}) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-base font-semibold text-[#2f3f4f]">{label}</span> : null}
      <input className="field" value={value} placeholder={placeholder} type={type} readOnly={readOnly} onChange={onChange} />
    </label>
  )
}

export function StatCard({ value, label }) {
  return (
    <div className="rounded-xl border border-[#dde6df] bg-white p-6 text-center">
      <h3 className="text-4xl font-bold text-[#283746]">{value}</h3>
      <p className="mt-2 text-sm font-semibold text-[#566b76]">{label}</p>
    </div>
  )
}

export function PageLoader() {
  return <div className="rounded-xl border border-[#dfe8e1] bg-[#f8fbf8] p-6 text-sm text-[#556974]">Loading data...</div>
}

export function ModalCard({ title, subtitle, children, centerTitle = false, max = 'max-w-3xl' }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4 backdrop-blur-[1px]">
      <div className={`w-full ${max} rounded-2xl bg-white p-6 shadow-2xl md:p-8`}>
        <h3 className={`text-5xl font-semibold text-[#45b14a] ${centerTitle ? 'text-center text-[#11182d]' : ''}`}>{title}</h3>
        {subtitle ? <p className="mb-5 mt-2 text-center text-lg text-[#67757e]">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  )
}

export function InfoRow({ k, v }) {
  return (
    <div className="grid grid-cols-2 gap-3 border-b border-[#edf2ee] py-2 text-lg">
      <dt className="font-semibold text-[#253647]">{k}</dt>
      <dd className="text-right text-[#283746]">{v}</dd>
    </div>
  )
}

export function OtpBoxes() {
  return (
    <div className="flex gap-4">
      {['8', '0', '-', '-'].map((v, i) => (
        <div key={`${v}-${i}`} className="otp-box">
          {v}
        </div>
      ))}
    </div>
  )
}
