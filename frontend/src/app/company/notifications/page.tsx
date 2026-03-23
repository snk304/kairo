'use client'

import { useNotifications, useMarkAllNotificationsRead } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CompanyNotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markAll = useMarkAllNotificationsRead()

  if (isLoading) return <LoadingSpinner className="py-20" />

  const notifications = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">通知</h1>
        {notifications.some((n) => !n.readAt) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            isLoading={markAll.isPending}
          >
            すべて既読にする
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>通知はありません</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={[
                'rounded-xl border p-4',
                notification.readAt
                  ? 'border-gray-200 bg-white'
                  : 'border-blue-200 bg-blue-50',
              ].join(' ')}
            >
              <p className="text-sm text-gray-800">
                {notification.data.message ?? notification.type}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(notification.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
