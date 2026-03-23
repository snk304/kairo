'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/authStore'

const sidebarItems = [
  { href: '/admin', label: 'ダッシュボード' },
  { href: '/admin/stats', label: '統計' },
  { href: '/admin/users', label: 'ユーザー管理' },
  { href: '/admin/jobs', label: '求人管理' },
  { href: '/admin/contacts', label: 'お問い合わせ' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth/login')
    } else if (user?.role !== 'admin') {
      router.replace('/')
    }
  }, [user, isAuthenticated, router])

  if (!isAuthenticated() || user?.role !== 'admin') return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        <Sidebar items={sidebarItems} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
