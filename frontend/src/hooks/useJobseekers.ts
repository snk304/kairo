import { useQuery } from '@tanstack/react-query'
import { jobseekersApi } from '@/lib/api/jobseekers'

export function useJobseekers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['jobseekers', params],
    queryFn: () => jobseekersApi.list(params),
    select: (res) => res.data,
  })
}

export function useJobseeker(id: string) {
  return useQuery({
    queryKey: ['jobseekers', id],
    queryFn: () => jobseekersApi.show(id),
    select: (res) => res.data.data,
  })
}

export function useMyJobseekerProfile() {
  return useQuery({
    queryKey: ['jobseekers', 'me'],
    queryFn: () => jobseekersApi.me(),
    select: (res) => res.data.data,
  })
}
