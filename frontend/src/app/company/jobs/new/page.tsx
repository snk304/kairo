'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { masterApi } from '@/lib/api/master'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateJob } from '@/hooks/useJobs'

const schema = z.object({
  title: z.string().min(1, '求人タイトルを入力してください'),
  description: z.string().min(1, '仕事内容を入力してください'),
  job_category_id: z.string().optional(),
  prefecture_id: z.string().optional(),
  employment_type: z.string().optional(),
  work_style: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  status: z.enum(['draft', 'published']),
})

type FormData = z.infer<typeof schema>

export default function NewJobPage() {
  const router = useRouter()
  const createJob = useCreateJob()

  const { data: categoriesRes } = useQuery({
    queryKey: ['master', 'job-categories'],
    queryFn: () => masterApi.jobCategories(),
  })
  const { data: prefecturesRes } = useQuery({
    queryKey: ['master', 'prefectures'],
    queryFn: () => masterApi.prefectures(),
  })

  const rawCategories = categoriesRes?.data.data
  const categories = Array.isArray(rawCategories) ? rawCategories : []
  const rawPrefectures = prefecturesRes?.data.data
  const prefectures = Array.isArray(rawPrefectures) ? rawPrefectures : []

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft' },
  })

  const onSubmit = (data: FormData) => {
    createJob.mutate(data as Parameters<typeof createJob.mutate>[0], {
      onSuccess: () => router.push('/company/jobs'),
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">求人を作成</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 max-w-2xl">
        <Input
          label="求人タイトル"
          placeholder="例：Webエンジニア（バックエンド）"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">仕事内容</label>
          <textarea
            {...register('description')}
            rows={6}
            placeholder="仕事内容を詳しく記載してください"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p role="alert" className="text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="職種"
            placeholder="選択してください"
            options={categories.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))}
            {...register('job_category_id')}
          />
          <Select
            label="都道府県"
            placeholder="選択してください"
            options={prefectures.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
            {...register('prefecture_id')}
          />
          <Select
            label="雇用形態"
            placeholder="選択してください"
            options={[
              { value: 'full_time', label: '正社員' },
              { value: 'part_time', label: 'パート・アルバイト' },
              { value: 'contract', label: '契約社員' },
              { value: 'dispatch', label: '派遣' },
            ]}
            {...register('employment_type')}
          />
          <Select
            label="勤務形態"
            placeholder="選択してください"
            options={[
              { value: 'office', label: '出社' },
              { value: 'remote', label: 'フルリモート' },
              { value: 'hybrid', label: 'ハイブリッド' },
            ]}
            {...register('work_style')}
          />
          <Input
            label="給与（下限）円"
            type="number"
            placeholder="例：200000"
            {...register('salary_min', { valueAsNumber: true })}
          />
          <Input
            label="給与（上限）円"
            type="number"
            placeholder="例：400000"
            {...register('salary_max', { valueAsNumber: true })}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="outline"
            onClick={() => {}}
            isLoading={createJob.isPending}
          >
            下書き保存
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit((data) => onSubmit({ ...data, status: 'published' }))()}
            isLoading={createJob.isPending}
          >
            公開する
          </Button>
        </div>
      </form>
    </div>
  )
}
