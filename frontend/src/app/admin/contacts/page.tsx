'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import type { Contact } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'

function ContactDetail({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  return (
    <Modal isOpen title="お問い合わせ詳細" onClose={onClose}>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="font-medium text-gray-700">氏名</dt>
          <dd className="mt-1 text-gray-900">{contact.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">メールアドレス</dt>
          <dd className="mt-1 text-gray-900">{contact.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">件名</dt>
          <dd className="mt-1 text-gray-900">{contact.subject}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">内容</dt>
          <dd className="mt-1 text-gray-900 whitespace-pre-wrap">{contact.body}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">受信日時</dt>
          <dd className="mt-1 text-gray-500">
            {new Date(contact.createdAt).toLocaleString('ja-JP')}
          </dd>
        </div>
      </dl>
    </Modal>
  )
}

function ContactList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selected, setSelected] = useState<Contact | null>(null)

  const page = searchParams.get('page') ?? '1'

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contacts', { page }],
    queryFn: () => adminApi.contacts({ page }),
    select: (res) => res.data,
  })

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/admin/contacts?${params.toString()}`)
  }

  if (isLoading) return <LoadingSpinner className="py-20" />

  const contacts = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>
        {meta && <p className="text-sm text-gray-500">{meta.total}件</p>}
      </div>

      {contacts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">お問い合わせはありません</p>
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelected(contact)}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 transition text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-full"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-400">{contact.email}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-600 truncate">{contact.subject}</p>
              </div>
              <p className="text-xs text-gray-400 shrink-0 ml-4">
                {new Date(contact.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </button>
          ))}
        </div>
      )}

      {meta && (
        <div className="mt-6">
          <Pagination meta={meta} onPageChange={handlePageChange} />
        </div>
      )}

      {selected && (
        <ContactDetail contact={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

export default function AdminContactsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" />}>
      <ContactList />
    </Suspense>
  )
}
