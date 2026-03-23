import Link from 'next/link'
import { JobCard } from '@/components/jobs/JobCard'
import { getServerApiUrl } from '@/lib/api/url'
import type { Job } from '@/types'

async function getFeaturedJobs(): Promise<Job[]> {
  try {
    const res = await fetch(
      `${getServerApiUrl()}/api/jobs?per_page=6`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

const features = [
  {
    num: '01',
    title: '配慮情報を詳しく掲載',
    description: '施設設備・勤務形態・コミュニケーション配慮など、各企業が提供する具体的な配慮内容を事前に確認できます。',
  },
  {
    num: '02',
    title: 'スカウト機能',
    description: 'プロフィールを公開すると、配慮環境が整った企業から直接スカウトを受け取れます。',
  },
  {
    num: '03',
    title: '安心のサポート体制',
    description: '応募から入社まで、Fittoのサポートチームがあなたに寄り添います。',
  },
]

const stats = [
  { value: '500+', label: '求職者登録' },
  { value: '300+', label: '企業掲載' },
  { value: '1,200+', label: '求人数' },
]

export default async function HomePage() {
  const featuredJobs = await getFeaturedJobs()

  return (
    <div>
      {/* ── Hero ─────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: '#1B3D2B', minHeight: '88vh', display: 'flex', alignItems: 'center' }}
      >
        {/* Decorative circles */}
        <div className="absolute pointer-events-none" style={{ right: '-60px', top: '50%', transform: 'translateY(-50%)', width: '640px', height: '640px', borderRadius: '50%', border: '1px solid rgba(235,242,238,0.06)' }} />
        <div className="absolute pointer-events-none" style={{ right: '40px', top: '50%', transform: 'translateY(-50%)', width: '420px', height: '420px', borderRadius: '50%', border: '1px solid rgba(235,242,238,0.08)' }} />
        <div className="absolute pointer-events-none" style={{ right: '140px', top: '50%', transform: 'translateY(-50%)', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(235,242,238,0.12)' }} />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />

        <div className="relative mx-auto max-w-7xl w-full px-4 py-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p
              className="animate-fade-in text-xs font-semibold tracking-[0.2em] uppercase mb-7"
              style={{ color: 'var(--clay)' }}
            >
              配慮マッチングプラットフォーム
            </p>

            <h1
              className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-[72px] font-bold leading-[1.08] tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', color: '#FEFCF8' }}
            >
              あなたらしく、<br />
              <span style={{ color: '#7DB88E' }}>働ける場所を。</span>
            </h1>

            <p
              className="animate-fade-up delay-200 mt-8 text-base sm:text-lg leading-relaxed max-w-xl"
              style={{ color: 'rgba(254,252,248,0.55)' }}
            >
              身体障害のある方と、配慮ある職場をつなぐマッチングサービス。
              <br className="hidden sm:block" />
              あなたの可能性を活かせる職場を一緒に見つけましょう。
            </p>

            <div className="animate-fade-up delay-300 mt-10 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none"
                style={{ backgroundColor: 'var(--clay)' }}
              >
                求人を探す
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/auth/register/jobseeker"
                className="inline-flex items-center rounded-xl border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10 focus-visible:outline-none"
                style={{ borderColor: 'rgba(254,252,248,0.3)', color: '#FEFCF8' }}
              >
                無料で登録する
              </Link>
            </div>

            <div
              className="animate-fade-up delay-400 mt-16 flex flex-wrap gap-10 pt-10"
              style={{ borderTop: '1px solid rgba(254,252,248,0.1)' }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: 'var(--font-serif)', color: '#FEFCF8' }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'rgba(254,252,248,0.4)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="py-32" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-16"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--forest)' }}>
                Features
              </p>
              <h2
                className="mt-3 text-3xl sm:text-4xl font-bold"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}
              >
                Fittoの特徴
              </h2>
            </div>
            <p className="text-sm max-w-xs" style={{ color: 'var(--ink-muted)' }}>
              配慮ある就職活動を、<br className="hidden sm:block" />あらゆる面からサポートします。
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-3" style={{ borderBottom: '1px solid var(--border)' }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className="py-12"
                style={{
                  paddingLeft: i > 0 ? '3rem' : undefined,
                  paddingRight: i < 2 ? '3rem' : undefined,
                  borderLeft: i > 0 ? '1px solid var(--border)' : undefined,
                }}
              >
                <div
                  className="text-[80px] font-bold leading-none select-none"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--forest-pale)' }}
                >
                  {f.num}
                </div>
                <div className="mt-6 h-px w-10" style={{ backgroundColor: 'var(--forest)' }} />
                <h3
                  className="mt-6 text-xl font-bold"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}
                >
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ─────────────────────────── */}
      {featuredJobs.length > 0 && (
        <section className="py-24" style={{ backgroundColor: 'var(--border-light)' }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--forest)' }}>
                  Jobs
                </p>
                <h2
                  className="mt-2 text-3xl font-bold"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}
                >
                  注目の求人
                </h2>
              </div>
              <Link
                href="/jobs"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium hover-forest"
              >
                すべて見る
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium hover-forest">
                すべての求人を見る
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Company CTA ───────────────────────────── */}
      <section className="relative overflow-hidden py-28" style={{ backgroundColor: 'var(--ink)' }}>
        <div
          className="absolute pointer-events-none"
          style={{ left: '-80px', top: '50%', transform: 'translateY(-50%)', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(245,241,235,0.05)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--clay)' }}>
              For Companies
            </p>
            <h2
              className="mt-4 text-4xl sm:text-5xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream)' }}
            >
              配慮ある採用を、<br />
              <span style={{ color: '#7DB88E' }}>一緒に実現しましょう。</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed" style={{ color: 'rgba(245,241,235,0.5)' }}>
              Fittoには配慮した職場環境を求める求職者が多数登録しています。
              スカウト機能で優れた人材に直接アプローチできます。
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/auth/register/company"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--cream)', color: 'var(--ink)' }}
              >
                企業登録（無料）
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/jobseekers"
                className="inline-flex items-center rounded-xl border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10"
                style={{ borderColor: 'rgba(245,241,235,0.25)', color: 'var(--cream)' }}
              >
                求職者を見る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
