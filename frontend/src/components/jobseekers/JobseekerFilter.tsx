'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { masterApi } from '@/lib/api/master'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export function JobseekerFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const rawDisability = disabilityRes?.data.data
  const disabilityTypes = Array.isArray(rawDisability) ? rawDisability : []
  const rawCat = categoriesRes?.data.data
  const categories = Array.isArray(rawCat) ? rawCat : []
  const rawPref = prefecturesRes?.data.data
  const prefectures = Array.isArray(rawPref) ? rawPref : []

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/jobseekers?${params.toString()}`)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">絞り込み</h2>
      <div className="flex flex-col gap-3">
        <Select
          label="障害種別"
          placeholder="すべての障害種別"
          value={searchParams.get('disability_type_id') ?? ''}
          options={disabilityTypes.map((d: { id: string; name: string }) => ({ value: d.id, label: d.name }))}
          onChange={(e) => handleChange('disability_type_id', e.target.value)}
        />
        <Select
          label="希望職種"
          placeholder="すべての職種"
          value={searchParams.get('job_category_id') ?? ''}
          options={categories.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))}
          onChange={(e) => handleChange('job_category_id', e.target.value)}
        />
        <Select
          label="都道府県"
          placeholder="すべての都道府県"
          value={searchParams.get('prefecture_id') ?? ''}
          options={prefectures.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
          onChange={(e) => handleChange('prefecture_id', e.target.value)}
        />
        <Select
          label="勤務形態"
          placeholder="すべての勤務形態"
          value={searchParams.get('work_style') ?? ''}
          options={[
            { value: 'office', label: '出社' },
            { value: 'remote', label: 'フルリモート' },
            { value: 'hybrid', label: 'ハイブリッド' },
          ]}
          onChange={(e) => handleChange('work_style', e.target.value)}
        />
        <Button variant="ghost" size="sm" onClick={() => router.push('/jobseekers')}>
          リセット
        </Button>
      </div>
    </div>
  )
}
