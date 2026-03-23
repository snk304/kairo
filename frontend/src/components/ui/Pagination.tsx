'use client'

import type { PaginationMeta } from '@/types'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page, last_page } = meta

  if (last_page <= 1) return null

  const pages = Array.from({ length: last_page }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 2)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="ページネーション">
      <button
        onClick={() => onPageChange(current_page - 1)}
        disabled={current_page === 1}
        className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="前のページ"
      >
        前へ
      </button>

      {pages.map((page, i) => {
        const prev = pages[i - 1]
        const showEllipsis = prev && page - prev > 1
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && <span className="px-2 text-gray-400">…</span>}
            <button
              onClick={() => onPageChange(page)}
              className={[
                'rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                page === current_page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              ].join(' ')}
              aria-current={page === current_page ? 'page' : undefined}
            >
              {page}
            </button>
          </span>
        )
      })}

      <button
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page === last_page}
        className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="次のページ"
      >
        次へ
      </button>
    </nav>
  )
}
