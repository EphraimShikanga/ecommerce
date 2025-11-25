import { ref } from 'vue'
import { CATEGORY_COLORS, STORAGE_KEYS } from '@/lib/constants'

/**
 * Load category colors from localStorage
 */
const loadCategoryColors = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORY_COLORS)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save category colors to localStorage
 */
const saveCategoryColors = (colorMap: Record<string, string>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORY_COLORS, JSON.stringify(colorMap))
  } catch (error) {
    console.error('Failed to save category colors:', error)
  }
}

/**
 * Composable for managing category badge colors
 * Provides consistent colors for categories with localStorage persistence
 */
export function useCategoryColors() {
  const categoryColorMap = ref<Record<string, string>>(loadCategoryColors())

  /**
   * Get or assign a color for a category
   * @param category - The category name
   * @returns The color classes for the category badge
   */
  const getCategoryColor = (category: string): string => {
    // Return existing color if available
    if (categoryColorMap.value[category]) {
      return categoryColorMap.value[category]
    }

    // Find an unused color
    const usedColors = Object.values(categoryColorMap.value)
    const unusedColor = CATEGORY_COLORS.find(color => !usedColors.includes(color))

    // Use unused color or random if all are used
    const availableColor =
      unusedColor ||
      CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)] ||
      'border-gray-500 text-gray-600 dark:text-gray-400'

    // Save and return
    categoryColorMap.value[category] = availableColor
    saveCategoryColors(categoryColorMap.value)

    return availableColor
  }

  /**
   * Format category name for display
   * Converts "mens-watches" to "Mens Watches"
   */
  const formatCategoryName = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return {
    getCategoryColor,
    formatCategoryName,
  }
}

