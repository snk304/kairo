import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  _hydrated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hydrated: false,
      setAuth: (user, token) => {
        set({ user, token })
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }
      },
      clearAuth: () => {
        set({ user: null, token: null })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hydrated: true })
      },
    }
  )
)
