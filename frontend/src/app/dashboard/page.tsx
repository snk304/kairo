'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useMyJobseekerProfile } from '@/hooks/useJobseekers'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardBody } from '@/components/ui/Card'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useMyJobseekerProfile()

  if (isLoading) return <LoadingSpinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {profile ? `${profile.lastName} ${profile.firstName}さん` : 'ダッシュボード'}
      </h1>

      {!profile && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
          <p className="text-lg font-semibold text-blue-800">プロフィールを作成しましょう</p>
          <p className="mt-2 text-sm text-blue-600">
            プロフィールを公開すると、企業からスカウトを受け取ることができます。
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            プロフィールを作成する
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="mt-1 text-sm text-gray-500">応募中</p>
            <Link href="/dashboard/applications" className="mt-3 inline-block text-xs text-blue-600 hover:text-blue-800">
              応募履歴を見る →
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="mt-1 text-sm text-gray-500">未読スカウト</p>
            <Link href="/dashboard/scouts" className="mt-3 inline-block text-xs text-blue-600 hover:text-blue-800">
              スカウトを見る →
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="mt-1 text-sm text-gray-500">未読メッセージ</p>
            <Link href="/dashboard/messages" className="mt-3 inline-block text-xs text-blue-600 hover:text-blue-800">
              メッセージを見る →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
