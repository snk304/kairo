'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { applicationsApi } from '@/lib/api/applications'

interface ApplyButtonProps {
  jobId: string
}

export function ApplyButton({ jobId }: ApplyButtonProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    useAuthStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  // hydration前はスケルトン表示
  if (!hydrated) {
    return (
      <div className="mt-6 h-12 w-full rounded-lg bg-gray-100 animate-pulse" />
    )
  }

  // 未ログイン → ログインページへ
  if (!isAuthenticated()) {
    return (
      <>
        <a
          href={`/auth/login?redirect=/jobs/${jobId}`}
          className="mt-6 block w-full rounded-lg py-3 text-center text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: 'var(--forest)' }}
        >
          この求人に応募する
        </a>
        <p className="mt-3 text-xs text-center" style={{ color: 'var(--ink-muted)' }}>
          応募にはログインが必要です
        </p>
      </>
    )
  }

  // 企業ログイン → 応募不可
  if (user?.role === 'company') {
    return (
      <div
        className="mt-6 block w-full rounded-lg py-3 text-center text-sm font-semibold cursor-not-allowed"
        style={{ backgroundColor: 'var(--border)', color: 'var(--ink-muted)' }}
      >
        企業アカウントは応募できません
      </div>
    )
  }

  // 応募済み
  if (applied) {
    return (
      <div
        className="mt-6 block w-full rounded-lg py-3 text-center text-sm font-semibold"
        style={{ backgroundColor: 'var(--forest-pale)', color: 'var(--forest)' }}
      >
        応募済み ✓
      </div>
    )
  }

  // 求職者ログイン → 応募ボタン
  const handleApply = async () => {
    setLoading(true)
    setError(null)
    try {
      await applicationsApi.apply(jobId)
      setApplied(true)
      router.refresh()
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setError('この求人にはすでに応募済みです')
        setApplied(true)
      } else {
        setError('応募に失敗しました。もう一度お試しください')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleApply}
        disabled={loading}
        className="mt-6 block w-full rounded-lg py-3 text-center text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--forest)' }}
      >
        {loading ? '応募中...' : 'この求人に応募する'}
      </button>
      {error && (
        <p className="mt-2 text-xs text-center" style={{ color: 'var(--clay)' }}>
          {error}
        </p>
      )}
    </>
  )
}
