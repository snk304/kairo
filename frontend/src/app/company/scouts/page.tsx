'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { scoutsApi } from '@/lib/api/scouts'
import { threadsApi } from '@/lib/api/threads'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CompanyScoutsPage() {
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['scouts', 'sent'],
    queryFn: () => scoutsApi.sent(),
    select: (res) => res.data.data,
  })

  const createThread = useMutation({
    mutationFn: (opponentId: string) =>
      threadsApi.create({ opponent_id: opponentId }),
    onSuccess: (res) => {
      router.push(`/company/messages/${res.data.data.id}`)
    },
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  const scouts = Array.isArray(data) ? data : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">スカウト管理</h1>

      {scouts.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>まだスカウトを送信していません</p>
          <p className="mt-1 text-sm">求職者一覧からスカウトを送ることができます</p>
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
                  <p className="text-sm font-semibold text-gray-900">
                    {scout.jobseeker?.lastName} {scout.jobseeker?.firstName}
                  </p>
                  {scout.job && (
                    <p className="mt-0.5 text-xs text-blue-600">{scout.job.title}</p>
                  )}
                </div>
                <Badge variant={scout.status === 'replied' ? 'green' : scout.status === 'read' ? 'yellow' : 'gray'}>
                  {scout.status === 'unread' ? '未読' : scout.status === 'read' ? '既読' : '返信あり'}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{scout.message}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {new Date(scout.createdAt).toLocaleDateString('ja-JP')}
                </p>
                {scout.jobseeker?.userId && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => createThread.mutate(scout.jobseeker!.userId)}
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
