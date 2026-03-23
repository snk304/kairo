'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { threadsApi } from '@/lib/api/threads'

interface MessageButtonProps {
  /** スレッドを作成する相手の users.id */
  opponentUserId: string
  label?: string
  className?: string
}

export function MessageButton({ opponentUserId, label = 'メッセージを送る', className }: MessageButtonProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)

  // 企業ログイン時のみ表示
  if (!isAuthenticated() || user?.role !== 'company') return null

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await threadsApi.create({ opponent_id: opponentUserId })
      router.push(`/company/messages/${res.data.data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className ?? 'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed'}
      style={!className ? { backgroundColor: 'var(--forest)' } : undefined}
    >
      {loading ? '...' : label}
    </button>
  )
}
