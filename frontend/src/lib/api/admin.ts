import apiClient from './client'
import type { User, Job, PaginatedResponse } from '@/types'

export interface Contact {
  id: string
  name: string
  email: string
  subject: string
  body: string
  createdAt: string
}

export interface AdminStats {
  total_jobseekers: number
  total_companies: number
  total_jobs: number
  total_applications: number
  total_scouts: number
  total_messages: number
}

export const adminApi = {
  users: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<User>>('/admin/users', { params }),

  suspendUser: (id: string) =>
    apiClient.put<{ data: User }>(`/admin/users/${id}/suspend`),

  deleteUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}`),

  jobs: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Job>>('/admin/jobs', { params }),

  unpublishJob: (id: string) =>
    apiClient.put<{ data: Job }>(`/admin/jobs/${id}/unpublish`),

  deleteJob: (id: string) =>
    apiClient.delete(`/admin/jobs/${id}`),

  contacts: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Contact>>('/admin/contacts', { params }),

  stats: () =>
    apiClient.get<{ data: AdminStats }>('/admin/stats'),
}
