import apiClient from './client'
import type { Notification, PaginatedResponse } from '@/types'

export const notificationsApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications', { params }),

  markAsRead: (id: string) =>
    apiClient.put<{ data: Notification }>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put('/notifications/read-all'),
}
