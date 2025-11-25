import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '@/lib/api'
import { STORAGE_KEYS } from '@/lib/constants'

/**
 * User interface
 */
interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  accessToken?: string
  refreshToken?: string
}

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

/**
 * Authentication store
 * Manages user authentication and session persistence
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
  }),

  getters: {
    /**
     * Check if user is authenticated
     */
    isAuthenticated: (state): boolean => !!state.accessToken,

    /**
     * Get user's full name
     */
    userFullName: (state): string => {
      if (!state.user) return ''
      return `${state.user.firstName} ${state.user.lastName}`
    },
  },

  actions: {
    /**
     * Login user with username and password
     */
    async login(username: string, password: string): Promise<User> {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid username or password')
      }

      const data = await response.json()

      // Update state
      this.user = data
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken

      // Persist to localStorage
      this.persistSession()

      return data
    },

    /**
     * Logout user and clear session
     */
    logout(): void {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem(STORAGE_KEYS.AUTH)
    },

    /**
     * Persist session to localStorage
     */
    persistSession(): void {
      try {
        localStorage.setItem(
          STORAGE_KEYS.AUTH,
          JSON.stringify({
            user: this.user,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
          })
        )
      } catch (error) {
        console.error('Failed to persist session:', error)
      }
    },

    /**
     * Restore session from localStorage
     */
    restoreSession(): void {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.AUTH)
        if (!stored) return

        const data = JSON.parse(stored)
        this.user = data.user
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem(STORAGE_KEYS.AUTH)
      }
    },
  },
})
