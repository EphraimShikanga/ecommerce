import {onMounted, ref} from 'vue'
import {API_ENDPOINTS, apiRequest} from '@/lib/api'

/**
 * Composable for managing product categories
 * Fetches and caches the list of available product categories
 */
export function useCategories() {
  const categories = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch categories from API
   */
  const fetchCategories = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      categories.value = await apiRequest<string[]>(API_ENDPOINTS.PRODUCTS.CATEGORY_LIST)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Auto-fetch on mount
  onMounted(() => {
    fetchCategories().then(r => r)
  })

  return {
    categories,
    loading,
    error,
    fetchCategories,
  }
}

