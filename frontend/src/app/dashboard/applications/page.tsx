'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api/applications'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

const statusConfig: Record<string, { label: string; variant: 'blue' | 'yellow' | 'green' | 'red' | 'gray' }> = {
  applied: { label: '応募済み', variant: 'blue' },
  screening: { label: '書類選考中', variant: 'yellow' },
  interview: { label: '面接中', variant: 'yellow' },
  offered: { label: '内定', variant: 'green' },
  rejected: { label: '不合格', variant: 'red' },
}

export default function ApplicationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => applicationsApi.me(),
    select: (res) => res.data,
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  const rawApplications = data?.data
  const applications = Array.isArray(rawApplications) ? rawApplications : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">応募履歴</h1>

      {applications.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>まだ応募した求人はありません</p>
          <Link href="/jobs" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800">
            求人を探す →
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {applications.map((app) => {
            const status = statusConfig[app.status] ?? { label: app.status, variant: 'gray' as const }
            return (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <Link
                    href={`/jobs/${app.job.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {app.job.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString('ja-JP')} に応募
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {app.threadId && (
                    <Link href={`/dashboard/messages/${app.threadId}`}>
                      <Button size="sm" variant="secondary">メッセージ</Button>
                    </Link>
                  )}
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
