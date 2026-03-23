import apiClient from './client'
import type { Job, PaginatedResponse } from '@/types'

export const jobsApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Job>>('/jobs', { params }),

  show: (id: string) =>
    apiClient.get<{ data: Job }>(`/jobs/${id}`),

  create: (data: Partial<Job>) =>
    apiClient.post<{ data: Job }>('/jobs', data),

  update: (id: string, data: Partial<Job>) =>
    apiClient.put<{ data: Job }>(`/jobs/${id}`, data),

  destroy: (id: string) =>
    apiClient.delete(`/jobs/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.put<{ data: Job }>(`/jobs/${id}/status`, { status }),

  myJobs: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Job>>('/jobs/me', { params }),

  apply: (id: string) =>
    apiClient.post(`/jobs/${id}/apply`),
}
