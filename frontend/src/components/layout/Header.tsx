'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'

const ROLE_CONFIG = {
  jobseeker: {
    label: '求職者',
    bg: 'var(--forest)',
    pale: 'var(--forest-pale)',
    color: 'var(--forest)',
    dashboardHref: '/dashboard',
    dashboardLabel: 'マイページ',
  },
  company: {
    label: '企業',
    bg: 'var(--clay)',
    pale: 'var(--clay-pale)',
    color: 'var(--clay)',
    dashboardHref: '/company',
    dashboardLabel: '企業管理',
  },
  admin: {
    label: '管理者',
    bg: 'var(--ink)',
    pale: 'var(--border-light)',
    color: 'var(--ink)',
    dashboardHref: '/admin',
    dashboardLabel: '管理画面',
  },
} as const

export function Header() {
  const { user, isAuthenticated } = useAuthStore()
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const role = user?.role as keyof typeof ROLE_CONFIG | undefined
  const roleConfig = role ? ROLE_CONFIG[role] : null
  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  // ドロップダウン外クリックで閉じる（dropdownOpen が true の時のみリスナー登録）
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

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
              {/* ナビリンク（ロール別） */}
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
                </>
              )}

              {/* ユーザーアバター＋ドロップダウン */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
                  style={{ backgroundColor: dropdownOpen ? 'var(--forest-pale)' : 'transparent' }}
                  onMouseEnter={(e) => {
                    if (!dropdownOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--border-light)'
                  }}
                  onMouseLeave={(e) => {
                    if (!dropdownOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* アバター */}
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: roleConfig?.bg ?? 'var(--ink)' }}
                  >
                    {initial}
                  </span>
                  {/* ロール＋メール */}
                  <span className="flex flex-col items-start leading-tight">
                    <span
                      className="text-xs font-bold"
                      style={{ color: roleConfig?.color ?? 'var(--ink)' }}
                    >
                      {roleConfig?.label}
                    </span>
                    <span
                      className="text-xs max-w-[140px] truncate"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      {user?.email}
                    </span>
                  </span>
                  {/* シェブロン */}
                  <svg
                    className="h-3.5 w-3.5 flex-shrink-0 transition-transform"
                    style={{
                      color: 'var(--ink-muted)',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* ドロップダウンメニュー */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-lg py-1.5 z-50"
                    style={{
                      backgroundColor: 'var(--cream-card)',
                      border: '1px solid var(--border-light)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                    }}
                  >
                    {/* ユーザー情報ヘッダー */}
                    <div
                      className="px-4 py-3 mb-1"
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: roleConfig?.bg ?? 'var(--ink)' }}
                        >
                          {initial}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold" style={{ color: roleConfig?.color ?? 'var(--ink)' }}>
                            {roleConfig?.label}としてログイン中
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ダッシュボードリンク */}
                    {roleConfig && (
                      <Link
                        href={roleConfig.dashboardHref}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--border-light)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--ink-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {roleConfig.dashboardLabel}
                      </Link>
                    )}

                    {/* ロール別追加リンク */}
                    {user?.role === 'jobseeker' && (
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--border-light)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--ink-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        プロフィール編集
                      </Link>
                    )}
                    {user?.role === 'company' && (
                      <Link
                        href="/company/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--border-light)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--ink-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        企業プロフィール
                      </Link>
                    )}

                    {/* ログアウト */}
                    <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '4px', paddingTop: '4px' }}>
                      <button
                        onClick={() => { logout.mutate(); setDropdownOpen(false) }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer"
                        style={{ color: '#dc2626' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                      >
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        ログアウト
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
          <Link href="/jobs" className="text-sm" style={{ color: 'var(--ink-mid)' }} onClick={() => setMenuOpen(false)}>
            求人を探す
          </Link>
          {(!isAuthenticated() || user?.role === 'company' || user?.role === 'admin') && (
            <Link href="/jobseekers" className="text-sm" style={{ color: 'var(--ink-mid)' }} onClick={() => setMenuOpen(false)}>
              求職者を探す
            </Link>
          )}
          {!isAuthenticated() ? (
            <>
              <Link href="/auth/login" className="text-sm" style={{ color: 'var(--ink-mid)' }} onClick={() => setMenuOpen(false)}>
                ログイン
              </Link>
              <Link href="/auth/register/jobseeker" className="text-sm font-medium" style={{ color: 'var(--forest)' }} onClick={() => setMenuOpen(false)}>
                求職者登録
              </Link>
              <Link href="/auth/register/company" className="text-sm font-medium" style={{ color: 'var(--forest)' }} onClick={() => setMenuOpen(false)}>
                企業登録
              </Link>
            </>
          ) : (
            <>
              {/* SP: ユーザー情報カード */}
              <div
                className="flex items-center gap-3 rounded-xl px-3 py-3"
                style={{ backgroundColor: roleConfig?.pale ?? 'var(--border-light)' }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: roleConfig?.bg ?? 'var(--ink)' }}
                >
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: roleConfig?.color ?? 'var(--ink)' }}>
                    {roleConfig?.label}としてログイン中
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>
                    {user?.email}
                  </p>
                </div>
              </div>
              {roleConfig && (
                <Link href={roleConfig.dashboardHref} className="text-sm font-medium" style={{ color: 'var(--ink)' }} onClick={() => setMenuOpen(false)}>
                  {roleConfig.dashboardLabel}
                </Link>
              )}
              <button
                onClick={() => { logout.mutate(); setMenuOpen(false) }}
                className="text-left text-sm cursor-pointer"
                style={{ color: '#dc2626' }}
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
