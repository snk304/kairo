'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Job } from '@/types'

interface JobCardProps {
  job: Job
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

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl bg-[var(--cream-card)] p-6 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
      style={{
        border: '1px solid var(--border-light)',
        boxShadow: '0 2px 12px rgba(27, 23, 20, 0.04)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = '0 8px 32px rgba(47, 95, 66, 0.12)'
        el.style.borderColor = 'var(--forest-pale)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = '0 2px 12px rgba(27, 23, 20, 0.04)'
        el.style.borderColor = 'var(--border-light)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Company & Category */}
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-xs font-medium tracking-wide uppercase truncate"
          style={{ color: 'var(--ink-muted)' }}
        >
          {job.company?.name}
        </p>
        {job.jobCategory && (
          <Badge variant="green" className="shrink-0">
            {job.jobCategory.name}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3
        className="mt-3 text-base font-bold leading-snug line-clamp-2"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}
      >
        {job.title}
      </h3>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {job.employmentType && (
          <Badge variant="gray">
            {employmentTypeLabel[job.employmentType] ?? job.employmentType}
          </Badge>
        )}
        {job.workStyle && (
          <Badge variant="blue">
            {workStyleLabel[job.workStyle] ?? job.workStyle}
          </Badge>
        )}
      </div>

      {/* Meta */}
      <div
        className="mt-5 flex items-center gap-4 text-xs pt-4"
        style={{ borderTop: '1px solid var(--border-light)', color: 'var(--ink-muted)' }}
      >
        {job.prefecture && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.prefecture.name}
          </span>
        )}
        {job.salaryMin && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salaryMin.toLocaleString()}円〜
            {job.salaryMax ? `${job.salaryMax.toLocaleString()}円` : ''}
          </span>
        )}
      </div>
    </Link>
  )
}
