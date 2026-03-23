import apiClient from './client'
import type { JobseekerProfile, PaginatedResponse } from '@/types'

export const jobseekersApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<JobseekerProfile>>('/jobseekers', { params }),

  show: (id: string) =>
    apiClient.get<{ data: JobseekerProfile }>(`/jobseekers/${id}`),

  me: () =>
    apiClient.get<{ data: JobseekerProfile }>('/jobseekers/me'),

  store: (data: Partial<JobseekerProfile>) =>
    apiClient.post<{ data: JobseekerProfile }>('/jobseekers/me', data),

  update: (data: Partial<JobseekerProfile>) =>
    apiClient.put<{ data: JobseekerProfile }>('/jobseekers/me', data),

  uploadResume: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<{ data: { resume_url: string } }>('/jobseekers/me/resume', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteResume: () =>
    apiClient.delete('/jobseekers/me/resume'),
}
