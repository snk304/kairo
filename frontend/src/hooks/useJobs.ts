import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api/jobs'
import type { Job } from '@/types'

export function useJobs(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.list(params),
    select: (res) => res.data,
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.show(id),
    select: (res) => res.data.data,
  })
}

export function useMyJobs(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['jobs', 'me', params],
    queryFn: () => jobsApi.myJobs(params),
    select: (res) => res.data,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Job>) => jobsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useUpdateJob(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Job>) => jobsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => jobsApi.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useUpdateJobStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      jobsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useApplyJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => jobsApi.apply(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}
