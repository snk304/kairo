import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isMine: boolean
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-xs rounded-2xl px-4 py-2.5 text-sm',
          isMine
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm',
        ].join(' ')}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
        <p className={`mt-1 text-xs ${isMine ? 'text-blue-200' : 'text-gray-400'} text-right`}>
          {new Date(message.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
