import apiClient from './client'
import type { Scout, PaginatedResponse } from '@/types'

export const scoutsApi = {
  received: () =>
    apiClient.get<PaginatedResponse<Scout>>('/scouts/received'),

  sent: () =>
    apiClient.get<PaginatedResponse<Scout>>('/scouts/sent'),

  send: (data: { jobseeker_id: string; job_id?: string; message: string }) =>
    apiClient.post<{ data: Scout }>('/scouts', data),

  markAsRead: (id: string) =>
    apiClient.put<{ data: Scout }>(`/scouts/${id}/read`),

  reply: (id: string, message: string) =>
    apiClient.put<{ data: Scout }>(`/scouts/${id}/reply`, { message }),
}
