import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, setAuth, clearAuth, isAuthenticated } = useAuthStore()

  return { user, isAuthenticated, setAuth, clearAuth }
}

export function useLogin(redirectTo?: string) {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: (res) => {
      const { token, user } = res.data.data
      setAuth(user, token)
      if (redirectTo) {
        router.push(redirectTo)
      } else if (user.role === 'jobseeker') {
        router.push('/dashboard')
      } else if (user.role === 'company') {
        router.push('/company')
      } else {
        router.push('/admin')
      }
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth()
      router.push('/auth/login')
    },
  })
}

export function useMe() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated(),
    select: (res) => res.data.data,
  })
}
