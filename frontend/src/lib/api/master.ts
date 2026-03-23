import apiClient from './client'

export interface MasterItem {
  id: string
  name: string
}

export const masterApi = {
  disabilityTypes: () =>
    apiClient.get<{ data: MasterItem[] }>('/master/disability-types'),

  jobCategories: () =>
    apiClient.get<{ data: MasterItem[] }>('/master/job-categories'),

  prefectures: () =>
    apiClient.get<{ data: MasterItem[] }>('/master/prefectures'),
}
