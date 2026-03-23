import apiClient from './client'
import type { User } from '@/types'

export const authApi = {
  registerJobseeker: (data: { email: string; password: string; password_confirmation: string }) =>
    apiClient.post('/auth/register/jobseeker', data),

  registerCompany: (data: { email: string; password: string; password_confirmation: string }) =>
    apiClient.post('/auth/register/company', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<{ data: { token: string; user: User } }>('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<{ data: User & { profile: unknown } }>('/auth/me'),
}
