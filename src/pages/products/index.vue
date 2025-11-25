<template>
  <div class="flex-1">
    <!-- Header -->
    <div class="border-b border-border px-8 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Products</h1>
          <p class="text-muted-foreground mt-1">
            Manage your inventory and view product performance.
          </p>
        </div>
        <Button class=" p-6 bg-primary text-primary-foreground hover:bg-primary/90" @click="navigateToAddProduct">
            <Plus class="w-24 h-24 rounded-full bg-primary-foreground text-primary"/>
          Add New Product
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <div class="px-8 py-4">
      <div class="flex justify-between p-4 rounded-xl gap-4 mb-6 bg-card">
        <div class="relative flex-1 max-w-3xl">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          <Input
              v-model="searchQuery"
              placeholder="Search by product name..."
              class="pl-10 bg-background border-input rounded-xl"
          />
        </div>
        <div class="flex gap-4">
          <Select v-model="selectedCategory">
            <SelectTrigger class="w-48 bg-background">
              <SelectValue placeholder="Category"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              <SelectItem
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ formatCategoryName(category) }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="selectedStock">
            <SelectTrigger class="w-48 bg-background">
              <SelectValue placeholder="Stock Status"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-stock">Stock Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-card rounded-xl border border-border">
        <Table>
          <TableHeader class="bg-background">
            <TableRow>
              <TableHead class="font-semibold">
                <button
                  @click="toggleSort('title')"
                  class="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Product
                  <component :is="getSortIcon('title')" class="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead class="font-semibold">
                <button
                  @click="toggleSort('category')"
                  class="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Category
                  <component :is="getSortIcon('category')" class="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead class="font-semibold">
                <button
                  @click="toggleSort('price')"
                  class="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Price
                  <component :is="getSortIcon('price')" class="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead class="font-semibold">
                <button
                  @click="toggleSort('stock')"
                  class="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Stock
                  <component :is="getSortIcon('stock')" class="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead class="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
                Loading products...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filteredProducts.length === 0">
              <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
            <TableRow
              v-else
              v-for="product in filteredProducts"
              :key="product.id"
              class="cursor-pointer hover:bg-muted/50"
              @click="router.push(`/products/${product.id}`)"
            >
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar class="w-12 h-12 rounded-full bg-primary/10">
                    <img
                      v-if="product.thumbnail"
                      :src="product.thumbnail"
                      :alt="product.title"
                      class="object-cover w-full h-full rounded-full"
                    />
                    <AvatarFallback class="bg-muted text-muted-foreground rounded-full">
                      {{ product.title.substring(0, 2).toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="flex-1">
                    <div class="font-medium text-foreground">
                      {{ product.title }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ truncateDescription(product.description) }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="rounded-lg font-normal" :class="getCategoryColor(product.category)">
                  {{ formatCategoryName(product.category) }}
                </Badge>
              </TableCell>
              <TableCell class="font-medium">
                ${{ product.price.toFixed(2) }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div :class="`w-2 h-2 rounded-full ${getStockColor(product.availabilityStatus)}`"/>
                  <span class="text-sm">
                    {{
                      product.availabilityStatus === 'Out of Stock'
                          ? 'Out of Stock'
                          : `${product.stock} ${product.availabilityStatus}`
                    }}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      @click.stop
                      class="hover:bg-primary/5 p-2 rounded-full"
                    >
                      <MoreVertical class="w-4 h-4"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" @click.stop>
                    <DropdownMenuItem @click="viewProduct(product.id)" class="cursor-pointer">
                      <Eye class="w-4 h-4 mr-2" />
                      View Product
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="editProduct(product.id)" class="cursor-pointer">
                      <Edit class="w-4 h-4 mr-2" />
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="openDeleteDialog(product.id)"
                      class="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6">
        <p class="text-sm text-muted-foreground">
          Showing <span class="text-primary">{{ startIndex }}</span> to
          <span class="text-primary">{{ endIndex }}</span> of
          <span class="text-primary">{{ total }}</span> results
        </p>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
            class="bg-card"
          >
            <ChevronLeft class="w-4 h-4"/>
          </Button>
          <span class="text-sm text-muted-foreground px-3">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <Button
            variant="outline"
            size="icon"
            :disabled="currentPage >= totalPages"
            @click="goToNextPage"
            class="bg-card"
          >
            <ChevronRight class="w-4 h-4"/>
          </Button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent
        class="sm:max-w-md"
        @interact-outside="(event: any) => {
          const target = event.target as HTMLElement;
          if (target?.closest('[data-sonner-toaster]')) return event.preventDefault()
        }"
      >
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="cancelDelete"
            :disabled="isDeleting"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCategories } from '@/composables/useCategories'
import { useCategoryColors } from '@/composables/useCategoryColors'
import { useProductStore } from '@/stores/products'
import type { Product } from '@/types/product'
import {
  PAGINATION,
  STOCK_STATUS,
  CATEGORY_FILTER,
  SORT_ORDER
} from '@/lib/constants'
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Search, Plus, ChevronLeft, ChevronRight, MoreVertical, Trash2, Eye, Edit, ArrowUpDown, ArrowUp, ArrowDown} from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'vue-sonner';

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()

// Composables
const { categories } = useCategories()
const { getCategoryColor, formatCategoryName } = useCategoryColors()

// Filters
const searchQuery = ref(route.query.search as string || '')
const selectedCategory = ref(CATEGORY_FILTER.ALL)
const selectedStock = ref<string>(STOCK_STATUS.ALL)

// Sorting
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>(SORT_ORDER.ASC)

// Pagination
const limit = ref<number>(PAGINATION.DEFAULT_LIMIT)
const skip = ref<number>(PAGINATION.DEFAULT_SKIP)
const currentPage = ref(1)

// Delete dialog state
const showDeleteDialog = ref(false);
const productToDelete = ref<number | null>(null);
const isDeleting = ref(false);


// Fetch products from store
const fetchProducts = async () => {
  await productStore.fetchProducts({
    limit: limit.value,
    skip: skip.value,
    search: searchQuery.value,
    category: selectedCategory.value,
    sortBy: sortBy.value,
    order: sortOrder.value,
  });
};

// Initial fetch
fetchProducts();

// Watch for changes in filters and refetch
watch([searchQuery, selectedCategory, skip, limit, sortBy, sortOrder], () => {
  fetchProducts();
});

// Watch for route query changes (when searching from header)
watch(() => route.query.search, (newSearch) => {
  if (newSearch !== undefined) {
    searchQuery.value = newSearch as string || '';
  }
});

// Computed properties from store
const products = computed(() => productStore.products)
const total = computed(() => productStore.total)
const loading = computed(() => productStore.isLoading)

/**
 * Filter products by stock status (client-side filtering)
 */
const filteredProducts = computed(() => {
  if (selectedStock.value === STOCK_STATUS.ALL) {
    return products.value
  }

  return products.value.filter((product: Product) => {
    const status = product.availabilityStatus.toLowerCase()

    if (selectedStock.value === STOCK_STATUS.IN_STOCK) {
      return status === 'in stock'
    }
    if (selectedStock.value === STOCK_STATUS.LOW_STOCK) {
      return status === 'low stock'
    }
    if (selectedStock.value === STOCK_STATUS.OUT_OF_STOCK) {
      return status === 'out of stock'
    }
    return true
  })
})

// Pagination calculations
const totalPages = computed(() => Math.ceil(total.value / limit.value));
const startIndex = computed(() => skip.value + 1);
const endIndex = computed(() => Math.min(skip.value + filteredProducts.value.length, total.value));

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    skip.value = (currentPage.value - 1) * limit.value;
  }
};

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    skip.value = (currentPage.value - 1) * limit.value;
  }
};

/**
 * Truncate description text
 */
const truncateDescription = (description: string, maxLength: number = 100): string => {
  if (description.length <= maxLength) {
    return description
  }
  return description.substring(0, maxLength).trim() + '…'
}

/**
 * Get stock indicator color
 */
const getStockColor = (availabilityStatus: string): string => {
  if (availabilityStatus === 'In Stock') return 'bg-green-500'
  if (availabilityStatus === 'Low Stock') return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Toggle sort order for a given field
 */
const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC
  } else {
    sortBy.value = field
    sortOrder.value = SORT_ORDER.ASC
  }

  currentPage.value = 1
  skip.value = PAGINATION.DEFAULT_SKIP
}

/**
 * Get the appropriate sort icon for a field
 */
const getSortIcon = (field: string) => {
  if (sortBy.value !== field) {
    return ArrowUpDown
  }
  return sortOrder.value === SORT_ORDER.ASC ? ArrowUp : ArrowDown
}

/**
 * Navigate to add product page
 */
const navigateToAddProduct = () => {
  router.push('/products/new')
}

/**
 * Navigate to product details page
 */
const viewProduct = (productId: number) => {
  router.push(`/products/${productId}`)
}

/**
 * Navigate to edit product page
 */
const editProduct = (productId: number) => {
  router.push(`/products/edit/${productId}`)
}

/**
 * Open delete confirmation dialog
 */
const openDeleteDialog = (productId: number) => {
  productToDelete.value = productId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (productToDelete.value === null) return;

  isDeleting.value = true;

  const deletePromise = productStore.deleteProduct(productToDelete.value);

  toast.promise(deletePromise, {
    loading: 'Deleting product...',
    success: () => {
      showDeleteDialog.value = false;
      productToDelete.value = null;
      return 'Product deleted successfully';
    },
    error: 'Failed to delete product',
  });
  isDeleting.value = false;
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
  productToDelete.value = null;
};
</script>
