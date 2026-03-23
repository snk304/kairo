'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'

export function Header() {
  const { user, isAuthenticated } = useAuthStore()
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: 'var(--cream-card)',
        borderBottom: '1px solid var(--border-light)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)] rounded-lg"
        >
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--forest)' }}
          >
            Fitto
          </span>
        </Link>

        {/* PC ナビ */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/jobs"
            className="text-sm transition-colors"
            style={{ color: 'var(--ink-muted)' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--ink)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-muted)')}
          >
            求人を探す
          </Link>
          {(!isAuthenticated() || user?.role === 'company' || user?.role === 'admin') && (
            <Link
              href="/jobseekers"
              className="text-sm transition-colors"
              style={{ color: 'var(--ink-muted)' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--ink)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-muted)')}
            >
              求職者を探す
            </Link>
          )}
        </nav>

        {/* PC 右側 */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated() ? (
            <>
              <Link
                href="/auth/login"
                className="text-sm px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
                style={{ color: 'var(--ink-muted)' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--ink)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-muted)')}
              >
                ログイン
              </Link>
              <Link
                href="/auth/register/jobseeker"
                className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--forest)]"
                style={{ backgroundColor: 'var(--forest)' }}
              >
                求職者登録
              </Link>
              <Link
                href="/auth/register/company"
                className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--forest-pale)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
                style={{ borderColor: 'var(--forest)', color: 'var(--forest)' }}
              >
                企業登録
              </Link>
            </>
          ) : (
            <>
              {user?.role === 'jobseeker' && (
                <>
                  {[
                    { href: '/dashboard/scouts', label: 'スカウト' },
                    { href: '/dashboard/messages', label: 'メッセージ' },
                    { href: '/dashboard/notifications', label: '通知' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--ink-muted)' }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--ink)')}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-muted)')}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/dashboard"
                    className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'var(--forest-pale)', color: 'var(--forest)' }}
                  >
                    マイページ
                  </Link>
                </>
              )}
              {user?.role === 'company' && (
                <>
                  {[
                    { href: '/company/messages', label: 'メッセージ' },
                    { href: '/company/notifications', label: '通知' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--ink-muted)' }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--ink)')}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-muted)')}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/company"
                    className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'var(--forest-pale)', color: 'var(--forest)' }}
                  >
                    企業管理
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                  style={{ backgroundColor: 'var(--forest-pale)', color: 'var(--forest)' }}
                >
                  管理画面
                </Link>
              )}
              {/* ログイン中ユーザー表示 */}
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                style={{ backgroundColor: 'var(--border-light)' }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={
                    user?.role === 'jobseeker'
                      ? { backgroundColor: 'var(--forest-pale)', color: 'var(--forest)' }
                      : user?.role === 'company'
                      ? { backgroundColor: 'var(--clay-pale)', color: 'var(--clay)' }
                      : { backgroundColor: 'var(--ink)', color: 'var(--cream)' }
                  }
                >
                  {user?.role === 'jobseeker' ? '求職者' : user?.role === 'company' ? '企業' : '管理者'}
                </span>
                <span className="text-xs max-w-[120px] truncate" style={{ color: 'var(--ink-muted)' }}>
                  {user?.email}
                </span>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border)]"
                style={{ color: 'var(--ink-muted)' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--ink)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-muted)')}
              >
                ログアウト
              </button>
            </>
          )}
        </div>

        {/* ハンバーガー（SP） */}
        <button
          className="md:hidden p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={menuOpen}
          style={{ color: 'var(--ink-muted)' }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* SP メニュー */}
      {menuOpen && (
        <div
          className="md:hidden px-4 py-5 flex flex-col gap-4"
          style={{ borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--cream-card)' }}
        >
          <Link
            href="/jobs"
            className="text-sm"
            style={{ color: 'var(--ink-mid)' }}
            onClick={() => setMenuOpen(false)}
          >
            求人を探す
          </Link>
          <Link
            href="/jobseekers"
            className="text-sm"
            style={{ color: 'var(--ink-mid)' }}
            onClick={() => setMenuOpen(false)}
          >
            求職者を探す
          </Link>
          {!isAuthenticated() ? (
            <>
              <Link
                href="/auth/login"
                className="text-sm"
                style={{ color: 'var(--ink-mid)' }}
                onClick={() => setMenuOpen(false)}
              >
                ログイン
              </Link>
              <Link
                href="/auth/register/jobseeker"
                className="text-sm font-medium"
                style={{ color: 'var(--forest)' }}
                onClick={() => setMenuOpen(false)}
              >
                求職者登録
              </Link>
              <Link
                href="/auth/register/company"
                className="text-sm font-medium"
                style={{ color: 'var(--forest)' }}
                onClick={() => setMenuOpen(false)}
              >
                企業登録
              </Link>
            </>
          ) : (
            <>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ backgroundColor: 'var(--border-light)' }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={
                    user?.role === 'jobseeker'
                      ? { backgroundColor: 'var(--forest-pale)', color: 'var(--forest)' }
                      : user?.role === 'company'
                      ? { backgroundColor: 'var(--clay-pale)', color: 'var(--clay)' }
                      : { backgroundColor: 'var(--ink)', color: 'var(--cream)' }
                  }
                >
                  {user?.role === 'jobseeker' ? '求職者' : user?.role === 'company' ? '企業' : '管理者'}
                </span>
                <span className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>
                  {user?.email}
                </span>
              </div>
              <button
                onClick={() => { logout.mutate(); setMenuOpen(false) }}
                className="text-left text-sm"
                style={{ color: 'var(--ink-muted)' }}
              >
                ログアウト
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
