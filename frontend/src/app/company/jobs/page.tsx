'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useMyJobs, useUpdateJobStatus, useDeleteJob } from '@/hooks/useJobs'

const statusConfig: Record<string, { label: string; variant: 'green' | 'gray' | 'red' }> = {
  published: { label: '公開中', variant: 'green' },
  draft: { label: '下書き', variant: 'gray' },
  closed: { label: '募集終了', variant: 'red' },
}

export default function CompanyJobsPage() {
  const { data, isLoading } = useMyJobs()
  const updateStatus = useUpdateJobStatus()
  const deleteJob = useDeleteJob()

  if (isLoading) return <LoadingSpinner className="py-20" />

  const rawJobs = data?.data
  const jobs = Array.isArray(rawJobs) ? rawJobs : []

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">求人管理</h1>
        <Link
          href="/company/jobs/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 新しい求人
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>求人がまだありません</p>
          <Link href="/company/jobs/new" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800">
            最初の求人を作成する →
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {jobs.map((job) => {
            const status = statusConfig[job.status] ?? { label: job.status, variant: 'gray' as const }
            return (
              <div
                key={job.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-gray-900">{job.title}</h2>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString('ja-JP')} 作成
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/company/jobs/${job.id}/applications`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      応募者管理
                    </Link>
                    <Link
                      href={`/company/jobs/${job.id}/edit`}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      編集
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({
                          id: job.id,
                          status: job.status === 'published' ? 'closed' : 'published',
                        })
                      }
                    >
                      {job.status === 'published' ? '募集終了にする' : '公開する'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm('この求人を削除しますか？')) {
                          deleteJob.mutate(job.id)
                        }
                      }}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
