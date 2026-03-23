'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { jobseekersApi } from '@/lib/api/jobseekers'
import { masterApi } from '@/lib/api/master'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const schema = z.object({
  first_name: z.string().min(1, '名を入力してください'),
  last_name: z.string().min(1, '姓を入力してください'),
  disability_type_id: z.string().optional(),
  disability_grade: z.string().optional(),
  desired_job_category_id: z.string().optional(),
  prefecture_id: z.string().optional(),
  desired_work_style: z.string().optional(),
  desired_employment_type: z.string().optional(),
  desired_salary: z.number().optional(),
  self_pr: z.string().optional(),
  is_public: z.boolean(),
})

type FormData = z.infer<typeof schema>

const MAX_RESUME_SIZE = 10 * 1024 * 1024 // 10MB

export default function ProfileEditPage() {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['jobseekers', 'me'],
    queryFn: () => jobseekersApi.me(),
    select: (res) => res.data.data,
  })

  const { data: disabilityRes } = useQuery({
    queryKey: ['master', 'disability-types'],
    queryFn: () => masterApi.disabilityTypes(),
  })
  const { data: categoriesRes } = useQuery({
    queryKey: ['master', 'job-categories'],
    queryFn: () => masterApi.jobCategories(),
  })
  const { data: prefecturesRes } = useQuery({
    queryKey: ['master', 'prefectures'],
    queryFn: () => masterApi.prefectures(),
  })

  const rawDisabilityTypes = disabilityRes?.data.data
  const disabilityTypes = Array.isArray(rawDisabilityTypes) ? rawDisabilityTypes : []
  const rawCategories = categoriesRes?.data.data
  const categories = Array.isArray(rawCategories) ? rawCategories : []
  const rawPrefectures = prefecturesRes?.data.data
  const prefectures = Array.isArray(rawPrefectures) ? rawPrefectures : []

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_public: false },
  })

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.firstName,
        last_name: profile.lastName,
        disability_type_id: profile.disabilityType?.id ?? '',
        disability_grade: profile.disabilityGrade ?? '',
        desired_job_category_id: profile.desiredJobCategory?.id ?? '',
        prefecture_id: profile.prefecture?.id ?? '',
        desired_work_style: profile.desiredWorkStyle ?? '',
        desired_employment_type: profile.desiredEmploymentType ?? '',
        desired_salary: profile.desiredSalary,
        self_pr: profile.selfPr ?? '',
        is_public: profile.isPublic,
      })
    }
  }, [profile, reset])

  const save = useMutation({
    mutationFn: (data: FormData) =>
      profile
        ? jobseekersApi.update(data as Parameters<typeof jobseekersApi.update>[0])
        : jobseekersApi.store(data as Parameters<typeof jobseekersApi.store>[0]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobseekers', 'me'] }),
  })

  const uploadResume = useMutation({
    mutationFn: (file: File) => jobseekersApi.uploadResume(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobseekers', 'me'] })
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
  })

  const deleteResume = useMutation({
    mutationFn: () => jobseekersApi.deleteResume(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobseekers', 'me'] }),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_RESUME_SIZE) {
      uploadResume.reset()
      // ファイルサイズエラーはカスタムエラーとして扱う
      return alert('ファイルサイズは10MB以下にしてください')
    }
    uploadResume.mutate(file)
  }

  const handleDeleteResume = () => {
    if (!confirm('履歴書を削除しますか？')) return
    deleteResume.mutate()
  }

  const resumeError =
    uploadResume.isError
      ? (uploadResume.error as AxiosError<{ message?: string }>)?.response?.data?.message ??
        'アップロードに失敗しました'
      : deleteResume.isError
      ? '削除に失敗しました'
      : null

  if (isLoading) return <LoadingSpinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>

      <form onSubmit={handleSubmit((data) => save.mutate(data))} className="mt-6 max-w-2xl space-y-6">
        {/* 基本情報 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="姓" {...register('last_name')} error={errors.last_name?.message} />
            <Input label="名" {...register('first_name')} error={errors.first_name?.message} />
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_public')} className="rounded" />
              <span>プロフィールを公開する（企業から検索されます）</span>
            </label>
          </div>
        </div>

        {/* 障害情報 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">障害情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="障害種別"
              placeholder="選択してください"
              options={disabilityTypes.map((d: { id: string; name: string }) => ({ value: d.id, label: d.name }))}
              {...register('disability_type_id')}
            />
            <Input label="障害等級" placeholder="例：2級" {...register('disability_grade')} />
          </div>
        </div>

        {/* 希望条件 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">希望条件</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="希望職種"
              placeholder="選択してください"
              options={categories.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))}
              {...register('desired_job_category_id')}
            />
            <Select
              label="希望勤務地"
              placeholder="選択してください"
              options={prefectures.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
              {...register('prefecture_id')}
            />
            <Select
              label="希望勤務形態"
              placeholder="選択してください"
              options={[
                { value: 'office', label: '出社' },
                { value: 'remote', label: 'フルリモート' },
                { value: 'hybrid', label: 'ハイブリッド' },
              ]}
              {...register('desired_work_style')}
            />
            <Select
              label="希望雇用形態"
              placeholder="選択してください"
              options={[
                { value: 'full_time', label: '正社員' },
                { value: 'part_time', label: 'パート・アルバイト' },
                { value: 'contract', label: '契約社員' },
              ]}
              {...register('desired_employment_type')}
            />
            <Input
              label="希望年収（万円）"
              type="number"
              placeholder="例：400"
              {...register('desired_salary', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* 自己PR */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">自己PR</h2>
          <textarea
            {...register('self_pr')}
            rows={5}
            placeholder="あなたの強みや経験を記載してください"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 履歴書 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">履歴書</h2>
          {profile?.resumeUrl ? (
            <div className="flex items-center gap-4">
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                現在の履歴書を確認する
              </a>
              <Button
                type="button"
                variant="outline"
                isLoading={deleteResume.isPending}
                onClick={handleDeleteResume}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                履歴書を削除
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">PDFファイル（最大10MB）をアップロードしてください</p>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={uploadResume.isPending}
                    aria-label="履歴書PDFファイルを選択"
                  />
                  <span
                    className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 ${
                      uploadResume.isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                  >
                    {uploadResume.isPending ? (
                      <>
                        <LoadingSpinner className="h-4 w-4" />
                        アップロード中...
                      </>
                    ) : (
                      'PDFを選択'
                    )}
                  </span>
                </label>
              </div>
            </div>
          )}
          {resumeError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {resumeError}
            </p>
          )}
          {uploadResume.isSuccess && (
            <p className="mt-2 text-sm text-green-600">履歴書をアップロードしました</p>
          )}
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
