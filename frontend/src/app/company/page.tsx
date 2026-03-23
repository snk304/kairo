'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { companiesApi } from '@/lib/api/companies'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardBody } from '@/components/ui/Card'

export default function CompanyDashboardPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['companies', 'me'],
    queryFn: () => companiesApi.me(),
    select: (res) => res.data.data,
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {profile ? profile.name : '企業ダッシュボード'}
      </h1>

      {!profile && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
          <p className="text-lg font-semibold text-blue-800">企業プロフィールを作成しましょう</p>
          <p className="mt-2 text-sm text-blue-600">
            プロフィールを設定すると、求職者への求人掲載やスカウトができます。
          </p>
          <Link
            href="/company/profile"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            プロフィールを作成する
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="text-center">
            <Link href="/company/jobs" className="block">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="mt-1 text-sm text-gray-500">公開中の求人</p>
              <p className="mt-3 text-xs text-blue-600">求人を管理する →</p>
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Link href="/company/scouts" className="block">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="mt-1 text-sm text-gray-500">送信済みスカウト</p>
              <p className="mt-3 text-xs text-blue-600">スカウトを確認する →</p>
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Link href="/company/messages" className="block">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="mt-1 text-sm text-gray-500">未読メッセージ</p>
              <p className="mt-3 text-xs text-blue-600">メッセージを見る →</p>
            </Link>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Link
          href="/company/jobs/new"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + 新しい求人を作成する
        </Link>
      </div>
    </div>
  )
}
