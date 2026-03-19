import { Logo, PageLoader } from '../../components/UI'
import { routes } from '../../config/routes'
import { navigate } from '../../hooks/useRouter'

function formatUpdatedAt(value) {
  if (!value) return 'Not published yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not published yet'

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function PublicShell({ children, title, subtitle, eyebrow = 'Fitco Public Pages' }) {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#edf6ef_28%,#ffffff_100%)]">
      <div className="border-b border-[#deebe0] bg-[radial-gradient(circle_at_top_left,rgba(95,179,105,0.22),transparent_22%),linear-gradient(135deg,#f5fbf5_0%,#eef7f0_52%,#f9fcf9_100%)]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:px-8 md:py-12 xl:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#65826a]">{eyebrow}</p>
              <Logo className="mt-3 text-left" />
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#203245] md:text-6xl">{title}</h1>
              {subtitle ? <p className="mt-4 max-w-3xl text-base leading-8 text-[#556977] md:text-xl">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => navigate(routes.publicInfo)}
              className="rounded-full border border-[#cfe1d1] bg-white px-6 py-3 text-sm font-semibold text-[#2f9b38] shadow-sm transition hover:bg-[#edf8ee]"
            >
              View all public pages
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-10 xl:px-12">{children}</div>
    </section>
  )
}

export function PublicLandingPage() {
  return (
    <PublicShell
      title="Fitness and nutrition support built for daily consistency."
      subtitle="Fitco is a wellness platform focused on helping users build healthier routines through practical fitness guidance, nutrition tracking, structured progress visibility, and a more consistent coaching experience."
      eyebrow="Fitco"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <div className="rounded-[32px] border border-[#dce8de] bg-white p-6 shadow-[0_18px_60px_rgba(44,78,49,0.06)] md:p-8">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(routes.publicInfo)}
                className="rounded-full bg-[var(--fitco-green)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fitco-green-dark)]"
              >
                View Legal Pages
              </button>
              <button
                type="button"
                onClick={() => navigate(routes.login)}
                className="rounded-full border border-[#cfe1d1] bg-white px-6 py-3 text-sm font-semibold text-[#2f9b38] shadow-sm transition hover:bg-[#edf8ee]"
              >
                Dashboard Login
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dce8de] bg-white p-6 shadow-[0_18px_60px_rgba(44,78,49,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c9384]">Core features</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#e3ece4] bg-[#f8fbf8] p-5">
                <h2 className="text-xl font-bold tracking-tight text-[#213546]">Nutrition support</h2>
                <p className="mt-3 text-sm leading-6 text-[#5b707d]">
                  Track food activity, support healthier eating habits, and keep progress visible in one place.
                </p>
              </div>
              <div className="rounded-[24px] border border-[#e3ece4] bg-[#f8fbf8] p-5">
                <h2 className="text-xl font-bold tracking-tight text-[#213546]">Fitness routine consistency</h2>
                <p className="mt-3 text-sm leading-6 text-[#5b707d]">
                  Encourage better adherence to wellness goals with a straightforward digital experience.
                </p>
              </div>
              <div className="rounded-[24px] border border-[#e3ece4] bg-[#f8fbf8] p-5">
                <h2 className="text-xl font-bold tracking-tight text-[#213546]">Progress visibility</h2>
                <p className="mt-3 text-sm leading-6 text-[#5b707d]">
                  Help users and administrators review activity, reports, and structured account information.
                </p>
              </div>
              <div className="rounded-[24px] border border-[#e3ece4] bg-[#f8fbf8] p-5">
                <h2 className="text-xl font-bold tracking-tight text-[#213546]">Coaching-ready workflow</h2>
                <p className="mt-3 text-sm leading-6 text-[#5b707d]">
                  Provide an app environment that supports guidance, accountability, and measurable improvement over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[32px] border border-[#dce8de] bg-[#f7fbf7] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c9384]">Contact</p>
            <p className="mt-3 text-sm leading-6 text-[#5b707d]">For support, compliance, and review inquiries:</p>
            <a href="mailto:fahad@fitcoksa.com" className="mt-3 block text-sm font-semibold text-[#2f9b38]">
              fahad@fitcoksa.com
            </a>
          </div>

          <div className="rounded-[32px] border border-[#dce8de] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c9384]">Public links</p>
            <div className="mt-4 space-y-2">
              {[
                { title: 'Legal Hub', path: routes.publicInfo },
                { title: 'About', path: routes.publicAbout },
                { title: 'Privacy Policy', path: routes.publicPrivacy },
                { title: 'Terms & Conditions', path: routes.publicTerms },
              ].map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="flex w-full items-center justify-between rounded-2xl bg-[#f7fbf8] px-4 py-3 text-left text-sm font-semibold text-[#28404f] transition hover:bg-[#edf8ee] hover:text-[var(--fitco-green)]"
                >
                  <span>{item.title}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PublicShell>
  )
}

export function PublicCmsHub({ items, onCopyLink }) {
  return (
    <PublicShell
      title="Public app review pages"
      subtitle="These pages are publicly accessible and can be shared directly for App Store and Play Store review."
    >
      <div className="grid gap-5 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className="group rounded-[32px] border border-[#d9e7db] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf8_100%)] p-7 text-left transition hover:-translate-y-0.5 hover:border-[#b9d7bd] hover:shadow-[0_18px_44px_rgba(65,177,73,0.12)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c9384]">Public page</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#213546]">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5b707d]">{item.description}</p>
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f2f8f3] px-4 py-3">
              <code className="text-xs font-semibold text-[#2f9b38]">{item.path}</code>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onCopyLink(item.path)
                  }}
                  className="rounded-full border border-[#cfe1d1] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f9b38]"
                >
                  Copy
                </button>
                <span className="text-lg text-[#2f9b38] transition group-hover:translate-x-1">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </PublicShell>
  )
}

export function PublicCmsContentPage({ page, loading, error, relatedLinks = [], currentPath, onCopyLink }) {
  if (loading) {
    return (
      <PublicShell title="Loading content" subtitle="Fetching the latest published CMS content from the backend.">
        <PageLoader />
      </PublicShell>
    )
  }

  if (error) {
    return (
      <PublicShell title="Content unavailable" subtitle="The public CMS endpoint did not return a valid response.">
        <div className="rounded-3xl border border-[#f1d3d3] bg-[#fff6f6] p-5 text-sm text-[#9b3a3a]">
          {error?.payload?.message || error?.message || 'Unable to load this page right now.'}
        </div>
      </PublicShell>
    )
  }

  const hasContent = String(page?.content || '').replace(/<[^>]+>/g, '').trim().length > 0

  return (
    <PublicShell
      eyebrow="Fitco Legal / Company"
      title={page?.title || 'Public content'}
      subtitle={`Last updated ${formatUpdatedAt(page?.updatedAt)}. This page is loaded from the backend public CMS API.`}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="overflow-hidden rounded-[32px] border border-[#dce8de] bg-white shadow-[0_18px_60px_rgba(44,78,49,0.06)]">
          <div className="border-b border-[#e5eee6] bg-[#f8fbf8] px-5 py-4 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7b8f80]">Published content</p>
              <button
                type="button"
                onClick={() => onCopyLink(currentPath)}
                className="rounded-full border border-[#cfe1d1] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2f9b38] transition hover:bg-[#edf8ee]"
              >
                Copy page link
              </button>
            </div>
          </div>
          {hasContent ? (
            <div
              className="prose prose-sm max-w-none px-5 py-8 text-[#314352] md:px-10 md:py-10 [&_a]:text-[#2f9b38] [&_blockquote]:border-l-4 [&_blockquote]:border-[#cce0cf] [&_blockquote]:pl-4 [&_h1]:text-[#203245] [&_h2]:mt-8 [&_h2]:text-[#203245] [&_h3]:mt-6 [&_li]:marker:text-[#2f9b38]"
              dangerouslySetInnerHTML={{ __html: page?.content }}
            />
          ) : (
            <div className="px-5 py-8 md:px-10 md:py-10">
              <div className="rounded-[24px] border border-dashed border-[#cfe1d1] bg-[#f8fbf8] p-6">
                <h2 className="text-xl font-bold tracking-tight text-[#213546]">Content not published yet</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5b707d]">
                  This public page is connected correctly, but the backend CMS does not have published text for this section yet.
                </p>
              </div>
            </div>
          )}
        </article>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[32px] border border-[#dce8de] bg-[#f7fbf7] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c9384]">Quick links</p>
            <div className="mt-4 space-y-2">
              {relatedLinks.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    item.active ? 'bg-[var(--fitco-green)] text-white' : 'bg-white text-[#28404f] hover:bg-[#edf8ee] hover:text-[var(--fitco-green)]'
                  }`}
                >
                  <span>{item.title}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dce8de] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c9384]">Reviewer note</p>
            <p className="mt-3 text-sm leading-6 text-[#5b707d]">
              Use this URL directly in your App Store and Play Store submission. It is public and does not require dashboard login.
            </p>
          </div>
        </aside>
      </div>
    </PublicShell>
  )
}
