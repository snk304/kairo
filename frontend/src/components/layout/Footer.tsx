import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--ink)', color: 'var(--cream)' }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream)' }}
            >
              Fitto
            </span>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(245,241,235,0.5)' }}>
              身体障害のある方と企業をつなぐ<br />配慮マッチングプラットフォーム
            </p>
          </div>

          {/* 求職者の方 */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(245,241,235,0.4)' }}>
              求職者の方
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {[
                { href: '/auth/register/jobseeker', label: '新規登録' },
                { href: '/jobs', label: '求人を探す' },
                { href: '/dashboard', label: 'マイページ' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 企業の方 */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(245,241,235,0.4)' }}>
              企業の方
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {[
                { href: '/auth/register/company', label: '企業登録' },
                { href: '/jobseekers', label: '求職者を探す' },
                { href: '/company', label: '企業管理' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(245,241,235,0.4)' }}>
              サービス
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {[
                { href: '/about', label: 'Fittoについて' },
                { href: '/contact', label: 'お問い合わせ' },
                { href: '/privacy', label: 'プライバシーポリシー' },
                { href: '/terms', label: '利用規約' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: '1px solid rgba(245,241,235,0.1)', color: 'rgba(245,241,235,0.3)' }}
        >
          <span>&copy; {new Date().getFullYear()} Fitto. All rights reserved.</span>
          <span>配慮ある社会をつくる</span>
        </div>
      </div>
    </footer>
  )
}
