import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  email: string
  name: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (token, user) => {
        localStorage.setItem('hb_token', token)
        set({ token, user })
      },
      logout: () => {
        localStorage.removeItem('hb_token')
        set({ token: null, user: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'hb_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)
