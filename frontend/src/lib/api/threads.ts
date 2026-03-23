import apiClient from './client'
import type { Thread, Message, PaginatedResponse } from '@/types'

export const threadsApi = {
  list: () =>
    apiClient.get<PaginatedResponse<Thread>>('/threads'),

  show: (id: string) =>
    apiClient.get<{ data: Thread & { messages: Message[] } }>(`/threads/${id}`),

  create: (data: { opponent_id: string; scout_id?: string; application_id?: string }) =>
    apiClient.post<{ data: Thread }>('/threads', data),

  sendMessage: (id: string, body: string) =>
    apiClient.post<{ data: Message }>(`/threads/${id}/messages`, { body }),

  markAsRead: (id: string) =>
    apiClient.put(`/threads/${id}/read`),
}
