'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { scoutsApi } from '@/lib/api/scouts'
import { threadsApi } from '@/lib/api/threads'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ScoutsPage() {
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['scouts', 'received'],
    queryFn: () => scoutsApi.received(),
    select: (res) => res.data,
  })

  const createThread = useMutation({
    mutationFn: (opponentId: string) =>
      threadsApi.create({ opponent_id: opponentId }),
    onSuccess: (res) => {
      router.push(`/dashboard/messages/${res.data.data.id}`)
    },
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  const rawScouts = data?.data
  const scouts = Array.isArray(rawScouts) ? rawScouts : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">スカウト</h1>

      {scouts.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>スカウトはまだ届いていません</p>
          <p className="mt-1 text-sm">プロフィールを公開すると企業からスカウトが届きます</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {scouts.map((scout) => (
            <div
              key={scout.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{scout.company?.name}</p>
                  {scout.job && (
                    <p className="mt-0.5 text-xs text-blue-600">{scout.job.title}</p>
                  )}
                </div>
                <Badge variant={scout.status === 'unread' ? 'blue' : 'gray'}>
                  {scout.status === 'unread' ? '未読' : scout.status === 'read' ? '既読' : '返信済み'}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-gray-600 line-clamp-3">{scout.message}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {new Date(scout.createdAt).toLocaleDateString('ja-JP')}
                </p>
                {scout.company?.userId && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => createThread.mutate(scout.company!.userId)}
                    disabled={createThread.isPending}
                  >
                    メッセージを送る
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
