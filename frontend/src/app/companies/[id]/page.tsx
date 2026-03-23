import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerApiUrl } from '@/lib/api/url'
import type { CompanyProfile } from '@/types'

async function getCompany(id: string): Promise<CompanyProfile | null> {
  const res = await fetch(
    `${getServerApiUrl()}/api/companies/${id}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const company = await getCompany(id)
  if (!company) return { title: '企業が見つかりません' }
  return { title: company.name }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = await getCompany(id)

  if (!company) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
          {company.industry && (
            <div>
              <span className="font-medium text-gray-700">業種</span>
              <p>{company.industry}</p>
            </div>
          )}
          {company.employeeCount && (
            <div>
              <span className="font-medium text-gray-700">従業員数</span>
              <p>{company.employeeCount}名</p>
            </div>
          )}
          {company.prefecture && (
            <div>
              <span className="font-medium text-gray-700">所在地</span>
              <p>{company.prefecture.name}{company.address ? ` ${company.address}` : ''}</p>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">障がい者雇用実績</span>
            <p>{company.disabledHireCount}名</p>
          </div>
        </div>

        {company.description && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-900">企業紹介</h2>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{company.description}</p>
          </div>
        )}

        {company.considerations && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-900">配慮・サポート体制</h2>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              {company.considerations.facility && company.considerations.facility.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700">施設・設備</p>
                  <ul className="mt-1 list-disc list-inside text-gray-600">
                    {company.considerations.facility.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {company.considerations.workStyle && company.considerations.workStyle.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700">勤務形態</p>
                  <ul className="mt-1 list-disc list-inside text-gray-600">
                    {company.considerations.workStyle.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
