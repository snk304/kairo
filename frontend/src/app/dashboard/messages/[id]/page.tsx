'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { threadsApi } from '@/lib/api/threads'
import { useAuthStore } from '@/store/authStore'
import { MessageBubble } from '@/components/messages/MessageBubble'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthStore()
  const [body, setBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: thread, isLoading } = useQuery({
    queryKey: ['threads', id],
    queryFn: () => threadsApi.show(id),
    select: (res) => res.data.data,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })

  const send = useMutation({
    mutationFn: (text: string) => threadsApi.sendMessage(id, text),
    onSuccess: () => {
      setBody('')
      qc.invalidateQueries({ queryKey: ['threads', id] })
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  if (isLoading) return <LoadingSpinner className="py-20" />
  if (!thread) return <p className="text-center text-gray-400 py-20">スレッドが見つかりません</p>

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-xl font-bold text-gray-900">{thread.opponent.name}</h1>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2">
        {(thread.messages ?? []).map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.senderId === user?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 送信フォーム */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (body.trim()) send.mutate(body.trim())
          }}
          className="flex gap-2"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="メッセージを入力..."
            rows={2}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (body.trim()) send.mutate(body.trim())
              }
            }}
          />
          <Button type="submit" isLoading={send.isPending} disabled={!body.trim()}>
            送信
          </Button>
        </form>
        <p className="mt-1 text-xs text-gray-400">Cmd/Ctrl + Enter で送信</p>
      </div>
    </div>
  )
}
