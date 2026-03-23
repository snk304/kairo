'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Pagination } from '@/components/ui/Pagination'

function UserList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qc = useQueryClient()

  const role = searchParams.get('role') ?? ''
  const page = searchParams.get('page') ?? '1'

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { role, page }],
    queryFn: () => adminApi.users({ ...(role ? { role } : {}), page }),
    select: (res) => res.data,
  })

  const suspend = useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('role', value)
    else params.delete('role')
    params.delete('page')
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/admin/users?${params.toString()}`)
  }

  if (isLoading) return <LoadingSpinner className="py-20" />

  const users = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        {meta && <p className="text-sm text-gray-500">{meta.total}件</p>}
      </div>

      <div className="mb-4 w-48">
        <Select
          placeholder="すべてのロール"
          value={role}
          options={[
            { value: 'jobseeker', label: '求職者' },
            { value: 'company', label: '企業' },
            { value: 'admin', label: '管理者' },
          ]}
          onChange={(e) => handleRoleChange(e.target.value)}
        />
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-400 py-20">ユーザーが見つかりません</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  <Badge
                    variant={
                      user.role === 'admin' ? 'purple' : user.role === 'company' ? 'blue' : 'gray'
                    }
                  >
                    {user.role === 'admin' ? '管理者' : user.role === 'company' ? '企業' : '求職者'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 font-mono">{user.id}</p>
              </div>

              {user.role !== 'admin' && (
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`${user.email} を停止しますか？`)) {
                        suspend.mutate(user.id)
                      }
                    }}
                    isLoading={suspend.isPending}
                  >
                    停止
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm(`${user.email} を完全に削除しますか？この操作は取り消せません。`)) {
                        deleteUser.mutate(user.id)
                      }
                    }}
                    isLoading={deleteUser.isPending}
                  >
                    削除
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {meta && (
        <div className="mt-6">
          <Pagination
            meta={meta}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" />}>
      <UserList />
    </Suspense>
  )
}
