import { Suspense } from 'react'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilter } from '@/components/jobs/JobFilter'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getServerApiUrl } from '@/lib/api/url'
import type { Job, PaginationMeta } from '@/types'

interface SearchParams {
  job_category_id?: string
  prefecture_id?: string
  employment_type?: string
  work_style?: string
  page?: string
}

async function getJobs(params: SearchParams) {
  const query = new URLSearchParams(params as Record<string, string>)
  const res = await fetch(
    `${getServerApiUrl()}/api/jobs?${query.toString()}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return { data: [], meta: null }
  return res.json() as Promise<{ data: Job[]; meta: PaginationMeta }>
}

export const metadata = { title: '求人一覧' }

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { data: jobs, meta } = await getJobs(params)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">求人一覧</h1>
        {meta && (
          <p className="text-sm text-gray-500">
            {meta.total}件の求人
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* フィルター */}
        <div className="lg:w-64 shrink-0">
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <JobFilter />
          </Suspense>
        </div>

        {/* 求人一覧 */}
        <div className="flex-1">
          {jobs.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-lg">条件に合う求人が見つかりませんでした</p>
              <p className="mt-2 text-sm">絞り込み条件を変更してみてください</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
