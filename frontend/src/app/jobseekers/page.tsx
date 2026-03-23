import { Suspense } from 'react'
import { JobseekerCard } from '@/components/jobseekers/JobseekerCard'
import { JobseekerFilter } from '@/components/jobseekers/JobseekerFilter'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getServerApiUrl } from '@/lib/api/url'
import type { JobseekerProfile, PaginationMeta } from '@/types'

interface SearchParams {
  disability_type_id?: string
  job_category_id?: string
  prefecture_id?: string
  work_style?: string
  page?: string
}

async function getJobseekers(params: SearchParams) {
  const query = new URLSearchParams(params as Record<string, string>)
  const res = await fetch(
    `${getServerApiUrl()}/api/jobseekers?${query.toString()}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return { data: [], meta: null }
  return res.json() as Promise<{ data: JobseekerProfile[]; meta: PaginationMeta }>
}

export const metadata = { title: '求職者一覧' }

export default async function JobseekersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { data: jobseekers, meta } = await getJobseekers(params)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">求職者一覧</h1>
        {meta && (
          <p className="text-sm text-gray-500">{meta.total}人の求職者</p>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-64 shrink-0">
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <JobseekerFilter />
          </Suspense>
        </div>

        <div className="flex-1">
          {jobseekers.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-lg">条件に合う求職者が見つかりませんでした</p>
              <p className="mt-2 text-sm">絞り込み条件を変更してみてください</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobseekers.map((profile) => (
                <JobseekerCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
