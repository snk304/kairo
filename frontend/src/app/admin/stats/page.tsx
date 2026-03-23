'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardBody } from '@/components/ui/Card'

export default function AdminStatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats(),
    select: (res) => res.data.data,
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  const metrics = stats
    ? [
        { label: '求職者数', value: stats.total_jobseekers, color: 'text-blue-600' },
        { label: '企業数', value: stats.total_companies, color: 'text-green-600' },
        { label: '求人数', value: stats.total_jobs, color: 'text-purple-600' },
        { label: '応募数', value: stats.total_applications, color: 'text-orange-600' },
        { label: 'スカウト数', value: stats.total_scouts, color: 'text-pink-600' },
        { label: 'メッセージ数', value: stats.total_messages, color: 'text-indigo-600' },
      ]
    : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">統計</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardBody className="text-center py-8">
              <p className={`text-4xl font-bold ${m.color}`}>{m.value.toLocaleString()}</p>
              <p className="mt-2 text-sm text-gray-500">{m.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
