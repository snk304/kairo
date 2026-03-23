'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { threadsApi } from '@/lib/api/threads'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CompanyMessagesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: () => threadsApi.list(),
    select: (res) => res.data.data,
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  const threads = data ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">メッセージ</h1>

      {threads.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>メッセージはありません</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/company/messages/${thread.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{thread.opponent.name}</p>
                {thread.lastMessage && (
                  <p className="mt-0.5 text-xs text-gray-500 truncate">{thread.lastMessage.body}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {thread.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
                    {thread.unreadCount}
                  </span>
                )}
                {thread.lastMessage && (
                  <span className="text-xs text-gray-400">
                    {new Date(thread.lastMessage.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
