'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/authStore'

const sidebarItems = [
  { href: '/dashboard', label: 'ダッシュボード' },
  { href: '/dashboard/profile', label: 'プロフィール編集' },
  { href: '/jobs', label: '求人を探す' },
  { href: '/dashboard/applications', label: '応募履歴' },
  { href: '/dashboard/scouts', label: 'スカウト' },
  { href: '/dashboard/messages', label: 'メッセージ' },
  { href: '/dashboard/notifications', label: '通知' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth/login')
    } else if (user?.role === 'company') {
      router.replace('/company')
    } else if (user?.role === 'admin') {
      router.replace('/admin')
    }
  }, [user, isAuthenticated, router])

  if (!isAuthenticated() || user?.role !== 'jobseeker') return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        <Sidebar items={sidebarItems} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
