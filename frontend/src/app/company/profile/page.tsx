'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
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

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB

export default function CompanyProfilePage() {
  const qc = useQueryClient()
  const photoInputRef = useRef<HTMLInputElement>(null)

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

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => companiesApi.uploadPhoto(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies', 'me'] })
      if (photoInputRef.current) photoInputRef.current.value = ''
    },
  })

  const deletePhoto = useMutation({
    mutationFn: (photoId: string) => companiesApi.deletePhoto(photoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies', 'me'] }),
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PHOTO_SIZE) {
      return alert('ファイルサイズは5MB以下にしてください')
    }
    uploadPhoto.mutate(file)
  }

  const handleDeletePhoto = (photoId: string) => {
    if (!confirm('この写真を削除しますか？')) return
    deletePhoto.mutate(photoId)
  }

  const photoError =
    uploadPhoto.isError
      ? (uploadPhoto.error as AxiosError<{ message?: string }>)?.response?.data?.message ??
        'アップロードに失敗しました'
      : deletePhoto.isError
      ? '削除に失敗しました'
      : null

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

        {/* 企業写真 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">企業写真</h2>

          {/* アップロード済み写真一覧 */}
          {(profile?.photos ?? []).length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-3">
              {(profile?.photos ?? []).map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={photo.photoUrl}
                      alt="企業写真"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    disabled={deletePhoto.isPending}
                    aria-label="写真を削除"
                    className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white text-xs hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* アップロードボタン */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">画像ファイル（最大5MB）をアップロードしてください</p>
            <label className="cursor-pointer w-fit">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
                disabled={uploadPhoto.isPending}
                aria-label="企業写真を選択"
              />
              <span
                className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                  uploadPhoto.isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                {uploadPhoto.isPending ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    アップロード中...
                  </>
                ) : (
                  '写真を追加'
                )}
              </span>
            </label>
          </div>

          {photoError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {photoError}
            </p>
          )}
          {uploadPhoto.isSuccess && (
            <p className="mt-2 text-sm text-green-600">写真をアップロードしました</p>
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
