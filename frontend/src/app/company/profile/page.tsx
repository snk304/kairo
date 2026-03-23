'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/lib/api/companies'
import { masterApi } from '@/lib/api/master'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const schema = z.object({
  name: z.string().min(1, '企業名を入力してください'),
  industry: z.string().optional(),
  employee_count: z.number().optional(),
  prefecture_id: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  disabled_hire_count: z.number().min(0).optional(),
})

type FormData = z.infer<typeof schema>

export default function CompanyProfilePage() {
  const qc = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['companies', 'me'],
    queryFn: () => companiesApi.me(),
    select: (res) => res.data.data,
  })

  const { data: prefecturesRes } = useQuery({
    queryKey: ['master', 'prefectures'],
    queryFn: () => masterApi.prefectures(),
  })

  const rawPrefectures = prefecturesRes?.data.data
  const prefectures = Array.isArray(rawPrefectures) ? rawPrefectures : []

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { disabled_hire_count: 0, name: '' },
  })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        industry: profile.industry ?? '',
        employee_count: profile.employeeCount,
        prefecture_id: profile.prefecture?.id ?? '',
        address: profile.address ?? '',
        description: profile.description ?? '',
        disabled_hire_count: profile.disabledHireCount,
      })
    }
  }, [profile, reset])

  const save = useMutation({
    mutationFn: (data: FormData) =>
      profile
        ? companiesApi.update(data as Parameters<typeof companiesApi.update>[0])
        : companiesApi.store(data as Parameters<typeof companiesApi.store>[0]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies', 'me'] }),
  })

  if (isLoading) return <LoadingSpinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">企業プロフィール編集</h1>

      <form onSubmit={handleSubmit((data) => save.mutate(data))} className="mt-6 max-w-2xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <Input
              label="企業名"
              {...register('name')}
              error={errors.name?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="業種" placeholder="例：IT・通信" {...register('industry')} />
              <Input label="従業員数" type="number" {...register('employee_count', { valueAsNumber: true })} />
              <Select
                label="所在都道府県"
                placeholder="選択してください"
                options={prefectures.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
                {...register('prefecture_id')}
              />
              <Input label="住所" placeholder="例：渋谷区..." {...register('address')} />
              <Input
                label="障がい者雇用実績（名）"
                type="number"
                {...register('disabled_hire_count', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">企業紹介</h2>
          <textarea
            {...register('description')}
            rows={6}
            placeholder="企業の特徴・文化・障害者への配慮体制などを記載してください"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {save.isSuccess && (
          <p className="text-sm text-green-600">プロフィールを保存しました</p>
        )}
        {save.isError && (
          <p role="alert" className="text-sm text-red-600">保存に失敗しました</p>
        )}

        <Button type="submit" isLoading={save.isPending}>
          保存する
        </Button>
      </form>
    </div>
  )
}
