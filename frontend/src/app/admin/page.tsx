'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardBody } from '@/components/ui/Card'

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats(),
    select: (res) => res.data.data,
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  const items = stats
    ? [
        { label: '求職者数', value: stats.total_jobseekers, href: '/admin/users?role=jobseeker' },
        { label: '企業数', value: stats.total_companies, href: '/admin/users?role=company' },
        { label: '求人数', value: stats.total_jobs, href: '/admin/jobs' },
        { label: '応募数', value: stats.total_applications, href: '/admin/stats' },
        { label: 'スカウト数', value: stats.total_scouts, href: '/admin/stats' },
        { label: 'メッセージ数', value: stats.total_messages, href: '/admin/stats' },
      ]
    : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label}>
            <CardBody>
              <Link href={item.href} className="block">
                <p className="text-3xl font-bold text-blue-600">{item.value.toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-500">{item.label}</p>
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'ユーザー管理', desc: 'アカウントの停止・削除', href: '/admin/users' },
          { label: '求人管理', desc: '不適切な求人の非公開・削除', href: '/admin/jobs' },
          { label: 'お問い合わせ', desc: '問い合わせ内容の確認', href: '/admin/contacts' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <p className="font-semibold text-gray-900">{action.label}</p>
            <p className="mt-1 text-sm text-gray-500">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
