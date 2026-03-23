import apiClient from './client'
import type { Application, PaginatedResponse } from '@/types'

export const applicationsApi = {
  apply: (jobId: string) =>
    apiClient.post<{ data: Application }>(`/jobs/${jobId}/apply`),

  me: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Application>>('/applications/me', { params }),

  show: (id: string) =>
    apiClient.get<{ data: Application }>(`/applications/${id}`),

  byJob: (jobId: string) =>
    apiClient.get<PaginatedResponse<Application>>(`/jobs/${jobId}/applications`),

  updateStatus: (id: string, status: string) =>
    apiClient.put<{ data: Application }>(`/applications/${id}/status`, { status }),
}
