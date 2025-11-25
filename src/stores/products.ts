import { defineStore } from 'pinia'
import type { Product, ProductsResponse } from '@/types/product'
import { apiRequest, API_ENDPOINTS } from '@/lib/api'
import { CATEGORY_FILTER } from '@/lib/constants'

/**
 * Product store state interface
 */
interface ProductState {
  products: Product[]
  total: number
  isLoading: boolean
  error: string | null
}

/**
 * Fetch products parameters interface
 */
interface FetchProductsParams {
  limit?: number
  skip?: number
  search?: string
  category?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

/**
 * Build API URL with query parameters
 */
const buildProductsUrl = (params: FetchProductsParams): string => {
  const {
    limit = 30,
    skip = 0,
    search = '',
    category = CATEGORY_FILTER.ALL,
    sortBy = '',
    order = 'asc'
  } = params

  const queryParams: string[] = [
    `limit=${limit}`,
    `skip=${skip}`,
  ]

  if (sortBy && sortBy.trim()) {
    queryParams.push(`sortBy=${sortBy}`, `order=${order}`)
  }

  const queryString = queryParams.join('&')

  // Build URL based on search/category filter
  if (search && search.trim()) {
    return `${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(search)}&${queryString}`
  }

  if (category && category !== CATEGORY_FILTER.ALL) {
    return `${API_ENDPOINTS.PRODUCTS.CATEGORY(category)}?${queryString}`
  }

  return `${API_ENDPOINTS.PRODUCTS.BASE}?${queryString}`
}

export const useProductStore = defineStore('products', {
  state: (): ProductState => ({
    products: [],
    total: 0,
    isLoading: false,
    error: null,
  }),

  getters: {
    getProductById: (state) => (id: number) => {
      return state.products.find(product => product.id === id)
    },
  },

  actions: {
    /**
     * Fetch products with optional filters and pagination
     */
    async fetchProducts(params: FetchProductsParams = {}) {
      this.isLoading = true
      this.error = null

      try {
        const url = buildProductsUrl(params)
        const data = await apiRequest<ProductsResponse>(url)

        this.products = data.products
        this.total = data.total
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch products'
        console.error('Error fetching products:', err)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch a single product by ID
     */
    async fetchSingleProduct(id: number): Promise<Product | null> {
      this.isLoading = true
      this.error = null

      try {
        const product = await apiRequest<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id))

        // Update or add product to store
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = product
        } else {
          this.products.push(product)
        }

        return product
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch product'
        console.error('Error fetching product:', err)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Add a new product
     */
    async addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
      this.isLoading = true
      this.error = null

      try {
        const newProduct = await apiRequest<Product>(API_ENDPOINTS.PRODUCTS.ADD, {
          method: 'POST',
          body: JSON.stringify(product),
        })

        this.products.unshift(newProduct)
        this.total++

        return newProduct
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to add product'
        console.error('Error adding product:', err)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update an existing product
     */
    async updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
      this.isLoading = true
      this.error = null

      try {
        const updatedProduct = await apiRequest<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
          method: 'PUT',
          body: JSON.stringify(updates),
        })

        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }

        return updatedProduct
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update product'
        console.error('Error updating product:', err)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete a product by ID
     */
    async deleteProduct(id: number): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        await apiRequest(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
          method: 'DELETE',
        })

        // Remove product from store
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products.splice(index, 1)
          this.total--
        }

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete product'
        console.error('Error deleting product:', err)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Clear error state
     */

    clearError() {
      this.error = null
    }
  }
})

