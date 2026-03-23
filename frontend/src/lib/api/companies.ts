import apiClient from './client'
import type { CompanyProfile } from '@/types'

export const companiesApi = {
  show: (id: string) =>
    apiClient.get<{ data: CompanyProfile }>(`/companies/${id}`),

  me: () =>
    apiClient.get<{ data: CompanyProfile }>('/companies/me'),

  store: (data: Partial<CompanyProfile>) =>
    apiClient.post<{ data: CompanyProfile }>('/companies/me', data),

  update: (data: Partial<CompanyProfile>) =>
    apiClient.put<{ data: CompanyProfile }>('/companies/me', data),
}
