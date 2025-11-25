/**
 * API utility module for making authenticated HTTP requests
 * Centralizes authentication and request configuration
 */

/**
 * Get authentication headers from localStorage
 * @returns HeadersInit object with Content-Type and Authorization (if available)
 */
export const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  try {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const { accessToken } = JSON.parse(authData)
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
    }
  } catch (error) {
    console.error('Error parsing auth data:', error)
  }

  return headers
}

/**
 * Make an authenticated API request
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise with the response
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'https://dummyjson.com/auth/login',
  },
  PRODUCTS: {
    BASE: 'https://dummyjson.com/products',
    SEARCH: 'https://dummyjson.com/products/search',
    CATEGORY: (category: string) => `https://dummyjson.com/products/category/${category}`,
    BY_ID: (id: number) => `https://dummyjson.com/products/${id}`,
    ADD: 'https://dummyjson.com/products/add',
    CATEGORY_LIST: 'https://dummyjson.com/products/category-list',
  },
} as const

