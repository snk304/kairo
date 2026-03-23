import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/Badge'
import { ApplyButton } from '@/components/jobs/ApplyButton'
import { getServerApiUrl } from '@/lib/api/url'
import type { Job } from '@/types'

async function getJob(id: string): Promise<Job | null> {
  const res = await fetch(
    `${getServerApiUrl()}/api/jobs/${id}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id)
  if (!job) return { title: '求人が見つかりません' }
  return {
    title: job.title,
    description: `${job.company.name}の求人: ${job.description?.slice(0, 100)}`,
  }
}

const employmentTypeLabel: Record<string, string> = {
  full_time: '正社員',
  part_time: 'パート・アルバイト',
  contract: '契約社員',
  dispatch: '派遣',
}

const workStyleLabel: Record<string, string> = {
  office: '出社',
  remote: 'フルリモート',
  hybrid: 'ハイブリッド',
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getJob(id)

  if (!job) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* メインコンテンツ */}
        <article className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <Link
              href={`/companies/${job.company.id}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {job.company.name}
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.jobCategory && <Badge variant="blue">{job.jobCategory.name}</Badge>}
              {job.employmentType && (
                <Badge variant="gray">{employmentTypeLabel[job.employmentType] ?? job.employmentType}</Badge>
              )}
              {job.workStyle && (
                <Badge variant="green">{workStyleLabel[job.workStyle] ?? job.workStyle}</Badge>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
              {job.prefecture && (
                <div>
                  <span className="font-medium text-gray-700">勤務地</span>
                  <p>{job.prefecture.name}</p>
                </div>
              )}
              {(job.salaryMin || job.salaryMax) && (
                <div>
                  <span className="font-medium text-gray-700">給与</span>
                  <p>
                    {job.salaryMin?.toLocaleString()}円〜
                    {job.salaryMax ? `${job.salaryMax.toLocaleString()}円` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 仕事内容 */}
          {job.description && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">仕事内容</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">{job.description}</p>
            </div>
          )}

          {/* 配慮情報 */}
          {job.considerations && Object.keys(job.considerations).length > 0 && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">配慮・サポート情報</h2>
              {job.considerations.facility && job.considerations.facility.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">施設・設備</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.considerations.facility.map((item) => (
                      <Badge key={item} variant="blue">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {job.considerations.workStyle && job.considerations.workStyle.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">勤務形態の配慮</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.considerations.workStyle.map((item) => (
                      <Badge key={item} variant="green">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </article>

        {/* サイドバー（応募ボタン） */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">{job.company.name}</p>
            <p className="mt-1 text-xl font-bold text-gray-900 line-clamp-2">{job.title}</p>
            <ApplyButton jobId={job.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
