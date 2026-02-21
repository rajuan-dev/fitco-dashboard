function SettingIcon({ type }) {
  if (type === 'profile') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4.2 3.8-6 8-6s7.2 1.8 8 6H4z" />
      </svg>
    )
  }

  if (type === 'password') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'privacy') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    )
  }

  if (type === 'terms') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 3h10v18H7z" />
        <path d="M10 8h4M10 12h4M10 16h4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SettingRow({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-transparent px-2 py-3 text-left text-base text-[#2e3d4d] transition hover:border-[#def0e0] hover:bg-[#f4fbf5] hover:text-[var(--fitco-green)] md:px-3 md:text-lg"
    >
      <span className="flex items-center gap-3 font-medium">
        <span className="grid h-6 w-6 place-content-center text-[#7fa0b3]">
          <SettingIcon type={icon} />
        </span>
        <span>{label}</span>
      </span>
      <span className="text-[#8aa0ae]">›</span>
    </button>
  )
}

export default function SettingsPage({ onNavigate }) {
  return (
    <div className="rounded-2xl border border-[var(--fitco-border)] bg-white p-3 md:p-4">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a9aa6]">Preferences</p>
      <SettingRow icon="profile" label="Profile" onClick={() => onNavigate('profile')} />
      <SettingRow icon="password" label="Change Password" onClick={() => onNavigate('change-password')} />
      <SettingRow icon="privacy" label="Privacy Policy" onClick={() => onNavigate('privacy')} />
      <SettingRow icon="terms" label="Terms & Conditions" onClick={() => onNavigate('terms')} />
      <SettingRow icon="about" label="About Us" onClick={() => onNavigate('about')} />
    </div>
  )
}

