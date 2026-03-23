import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { JobseekerProfile } from '@/types'

interface JobseekerCardProps {
  profile: JobseekerProfile
}

const workStyleLabel: Record<string, string> = {
  office: '出社',
  remote: 'フルリモート',
  hybrid: 'ハイブリッド',
}

export function JobseekerCard({ profile }: JobseekerCardProps) {
  return (
    <Link
      href={`/jobseekers/${profile.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0">
          {profile.lastName?.[0] ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {profile.lastName} {profile.firstName}
          </p>
          {profile.disabilityType && (
            <p className="text-xs text-gray-500">{profile.disabilityType.name}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {profile.desiredJobCategory && (
          <Badge variant="blue">{profile.desiredJobCategory.name}</Badge>
        )}
        {profile.desiredWorkStyle && (
          <Badge variant="green">{workStyleLabel[profile.desiredWorkStyle] ?? profile.desiredWorkStyle}</Badge>
        )}
        {profile.desiredEmploymentType && (
          <Badge variant="gray">{profile.desiredEmploymentType}</Badge>
        )}
      </div>

      {profile.selfPr && (
        <p className="mt-3 text-xs text-gray-500 line-clamp-2">{profile.selfPr}</p>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        {profile.prefecture && <span>{profile.prefecture.name}</span>}
        {profile.desiredSalary && <span>希望年収 {profile.desiredSalary.toLocaleString()}万円</span>}
      </div>
    </Link>
  )
}
