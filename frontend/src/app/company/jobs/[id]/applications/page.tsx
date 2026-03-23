'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api/applications'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MessageButton } from '@/components/company/MessageButton'

const statusConfig: Record<string, { label: string; variant: 'blue' | 'yellow' | 'green' | 'red' | 'gray' }> = {
  applied: { label: '応募済み', variant: 'blue' },
  screening: { label: '書類選考中', variant: 'yellow' },
  interview: { label: '面接中', variant: 'yellow' },
  offered: { label: '内定', variant: 'green' },
  rejected: { label: '不合格', variant: 'red' },
}

const statusOptions = [
  { value: 'applied', label: '応募済み' },
  { value: 'screening', label: '書類選考中' },
  { value: 'interview', label: '面接中' },
  { value: 'offered', label: '内定' },
  { value: 'rejected', label: '不合格' },
]

export default function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'job', id],
    queryFn: () => applicationsApi.byJob(id),
    select: (res) => res.data.data,
  })

  const updateStatus = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      applicationsApi.updateStatus(appId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications', 'job', id] }),
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  const applications = Array.isArray(data) ? data : []

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/company/jobs" className="text-sm text-blue-600 hover:text-blue-800">
          ← 求人一覧
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">応募者一覧</h1>

      {applications.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>まだ応募者はいません</p>
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
                  <p className="text-sm font-semibold text-gray-900">応募者</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString('ja-JP')} に応募
                  </p>
                  <Badge variant={status.variant} className="mt-1">{status.label}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  {app.jobseeker?.id && (
                    <MessageButton
                      opponentUserId={app.jobseeker.id}
                      label="メッセージ"
                    />
                  )}
                  <Select
                    options={statusOptions}
                    value={app.status}
                    onChange={(e) => updateStatus.mutate({ appId: app.id, status: e.target.value })}
                    className="w-36"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
