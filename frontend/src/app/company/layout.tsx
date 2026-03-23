'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/authStore'

const sidebarItems = [
  { href: '/company', label: 'ダッシュボード' },
  { href: '/company/profile', label: '企業プロフィール' },
  { href: '/company/jobs', label: '求人管理' },
  { href: '/jobseekers', label: '求職者を探す' },
  { href: '/company/scouts', label: 'スカウト管理' },
  { href: '/company/messages', label: 'メッセージ' },
  { href: '/company/notifications', label: '通知' },
]

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth/login')
    } else if (user?.role === 'jobseeker') {
      router.replace('/dashboard')
    } else if (user?.role === 'admin') {
      router.replace('/admin')
    }
  }, [user, isAuthenticated, router])

  if (!isAuthenticated() || user?.role !== 'company') return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        <Sidebar items={sidebarItems} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
