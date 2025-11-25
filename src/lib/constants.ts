/**
 * Application-wide constants and configuration
 */

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 9,
  DEFAULT_SKIP: 0,
  ITEMS_PER_PAGE: 9,
} as const

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  AUTH: 'auth',
  CATEGORY_COLORS: 'category-colors',
} as const

/**
 * Sort orders
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const

/**
 * Stock status values
 */
export const STOCK_STATUS = {
  ALL: 'all-stock',
  IN_STOCK: 'in-stock',
  LOW_STOCK: 'low-stock',
  OUT_OF_STOCK: 'out-of-stock',
} as const

/**
 * Category filter value
 */
export const CATEGORY_FILTER = {
  ALL: 'all-categories',
} as const

/**
 * Available colors for category badges
 */
export const CATEGORY_COLORS = [
  'border-pink-500 text-pink-600 dark:text-pink-400 bg-pink-500/5',
  'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/5',
  'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5',
  'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5',
  'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-500/5',
  'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5',
  'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5',
  'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/5',
  'border-lime-500 text-lime-600 dark:text-lime-400 bg-lime-500/5',
  'border-green-500 text-green-600 dark:text-green-400 bg-green-500/5',
  'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
  'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-500/5',
  'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5',
  'border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-500/5',
  'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/5',
  'border-red-500 text-red-600 dark:text-red-400 bg-red-500/5',
  'border-fuchsia-500 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/5',
  'border-slate-500 text-slate-600 dark:text-slate-400 bg-slate-500/5',
] as const

/**
 * Validation rules
 */
export const VALIDATION = {
  MIN_PRICE: 0,
  MIN_STOCK: 0,
  MIN_DISCOUNT: 0,
  MAX_DISCOUNT: 100,
  MIN_ORDER_QUANTITY: 1,
} as const

