import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/Badge'
import { MessageButton } from '@/components/company/MessageButton'
import { getServerApiUrl } from '@/lib/api/url'
import type { JobseekerProfile } from '@/types'

async function getJobseeker(id: string): Promise<JobseekerProfile | null> {
  const res = await fetch(
    `${getServerApiUrl()}/api/jobseekers/${id}`,
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
  const profile = await getJobseeker(id)
  if (!profile) return { title: '求職者が見つかりません' }
  return { title: `${profile.lastName} ${profile.firstName}のプロフィール` }
}

const workStyleLabel: Record<string, string> = {
  office: '出社',
  remote: 'フルリモート',
  hybrid: 'ハイブリッド',
}

export default async function JobseekerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getJobseeker(id)

  if (!profile) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
              {profile.lastName?.[0] ?? '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.lastName} {profile.firstName}
              </h1>
              {profile.disabilityType && (
                <p className="text-sm text-gray-500">{profile.disabilityType.name}</p>
              )}
            </div>
          </div>
          <MessageButton opponentUserId={profile.userId} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {profile.desiredJobCategory && (
            <Badge variant="blue">{profile.desiredJobCategory.name}</Badge>
          )}
          {profile.desiredWorkStyle && (
            <Badge variant="green">{workStyleLabel[profile.desiredWorkStyle] ?? profile.desiredWorkStyle}</Badge>
          )}
          {profile.prefecture && (
            <Badge variant="gray">{profile.prefecture.name}</Badge>
          )}
        </div>

        {profile.selfPr && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-900">自己PR</h2>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{profile.selfPr}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          {profile.desiredEmploymentType && (
            <div>
              <span className="font-medium text-gray-700">希望雇用形態</span>
              <p className="text-gray-600">{profile.desiredEmploymentType}</p>
            </div>
          )}
          {profile.desiredSalary && (
            <div>
              <span className="font-medium text-gray-700">希望年収</span>
              <p className="text-gray-600">{profile.desiredSalary}万円</p>
            </div>
          )}
          {profile.disabilityGrade && (
            <div>
              <span className="font-medium text-gray-700">障害等級</span>
              <p className="text-gray-600">{profile.disabilityGrade}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
