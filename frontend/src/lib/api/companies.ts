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

  uploadPhoto: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<{ data: { photo_url: string } }>('/companies/me/photos', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deletePhoto: (photoId: string) =>
    apiClient.delete(`/companies/me/photos/${photoId}`),
}
