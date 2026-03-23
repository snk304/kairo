'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Pagination } from '@/components/ui/Pagination'

const statusConfig: Record<string, { label: string; variant: 'green' | 'gray' | 'red' }> = {
  published: { label: '公開中', variant: 'green' },
  draft: { label: '下書き', variant: 'gray' },
  closed: { label: '募集終了', variant: 'red' },
}

function JobList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qc = useQueryClient()

  const page = searchParams.get('page') ?? '1'

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'jobs', { page }],
    queryFn: () => adminApi.jobs({ page }),
    select: (res) => res.data,
  })

  const unpublish = useMutation({
    mutationFn: (id: string) => adminApi.unpublishJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'jobs'] }),
  })

  const deleteJob = useMutation({
    mutationFn: (id: string) => adminApi.deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'jobs'] }),
  })

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/admin/jobs?${params.toString()}`)
  }

  if (isLoading) return <LoadingSpinner className="py-20" />

  const jobs = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">求人管理</h1>
        {meta && <p className="text-sm text-gray-500">{meta.total}件</p>}
      </div>

      {jobs.length === 0 ? (
        <p className="text-center text-gray-400 py-20">求人が見つかりません</p>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => {
            const status = statusConfig[job.status] ?? { label: job.status, variant: 'gray' as const }
            return (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {job.company.name} · {new Date(job.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {job.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`「${job.title}」を強制非公開にしますか？`)) {
                          unpublish.mutate(job.id)
                        }
                      }}
                      isLoading={unpublish.isPending}
                    >
                      非公開にする
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm(`「${job.title}」を削除しますか？この操作は取り消せません。`)) {
                        deleteJob.mutate(job.id)
                      }
                    }}
                    isLoading={deleteJob.isPending}
                  >
                    削除
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {meta && (
        <div className="mt-6">
          <Pagination meta={meta} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" />}>
      <JobList />
    </Suspense>
  )
}
