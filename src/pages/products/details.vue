<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useProductStore} from '@/stores/products'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'
import {Separator} from '@/components/ui/separator'
import {
  Edit,
  Star,
  Package,
  Truck,
  Calendar,
  Tag,
  Barcode,
  Ruler,
  Weight,
  Trash2
} from 'lucide-vue-next'
import ReviewCarousel from '@/components/ReviewCarousel.vue'
import ReviewsDialog from '@/components/ReviewsDialog.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import {useCategoryColors} from "@/composables/useCategoryColors.ts";

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()

// Composables
const { getCategoryColor, formatCategoryName } = useCategoryColors()

const productId = computed(() => Number(route.params.id))

const product = ref<any>(null)
const loading = computed(() => productStore.isLoading)

const showAllReviews = ref(false)

const showDeleteDialog = ref(false)
const isDeleting = ref(false)

const openDeleteDialog = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!product.value) return

  isDeleting.value = true

  const deletePromise = productStore.deleteProduct(product.value.id)

  toast.promise(deletePromise, {
    loading: 'Deleting product...',
    success: (deleted: boolean) => {
      if (deleted) {
        showDeleteDialog.value = false
        router.push('/products')
        return 'Product deleted successfully'
      }
    },
    error: 'Failed to delete product',
  })

  try {
    await deletePromise
  } catch (error) {
    console.error('Delete error:', error)
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

/**
 * Fetch product data on mount
 */
onMounted(async () => {
  const fetchedProduct = await productStore.fetchSingleProduct(productId.value)
  if (fetchedProduct) {
    product.value = fetchedProduct
  }
})

/**
 * Calculate rating distribution for review statistics
 */
const calculateRatingDistribution = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) return []

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++
  })

  const total = reviews.length
  return Object.entries(distribution).map(([rating, count]) => ({
    rating: parseInt(rating),
    count,
    percentage: Math.round((count / total) * 100)
  })).reverse()
}

/**
 * Computed rating distribution
 */
const ratingDistribution = computed(() => {
  return product.value?.reviews ? calculateRatingDistribution(product.value.reviews) : []
})

/**
 * Get stock badge background color
 */
const getStockBadgeBg = computed(() => {
  if (!product.value) return 'bg-gray-200/80'

  switch (product.value.availabilityStatus) {
    case 'In Stock':
      return 'bg-green-200/80'
    case 'Low Stock':
      return 'bg-yellow-200/80'
    case 'Out of Stock':
      return 'bg-red-200/80'
    default:
      return 'bg-gray-200/80'
  }
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="px-8 py-4 text-sm text-muted-foreground">
      <button @click="router.push('/products')" class="hover:text-foreground">
        Products
      </button>
      <span class="mx-2">/</span>
      <span class="text-foreground">{{ product?.title || 'Loading...' }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="px-8 pb-8">
      <div class="text-center py-12">
        <p class="text-muted-foreground">Loading product details...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="product" class="px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Product Image -->
        <Card class="max-h-[500px] border-muted shadow-none">
          <CardContent class="p-8 max-h-[500px]">
            <img
                :src="product.thumbnail"
                :alt="product.title"
                class="w-full h-full object-contain rounded-lg"
            />
          </CardContent>
        </Card>

        <!-- Product Details -->
        <div class="space-y-2">
          <div>
            <h1 class="text-4xl font-bold text-foreground mb-2">
              {{ product.title }}
            </h1>
            <p class="text-muted-foreground">
              {{ product.description }}
            </p>
          </div>

          <div class="flex gap-3">
            <Button variant="secondary" class="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                    @click="router.push(`/products/edit/${product.id}`)">
              <Edit class="w-4 h-4"/>
              Edit Product
            </Button>
            <Button variant="destructive" class="gap-2 bg-destructive/80 hover:bg-destructive" @click="openDeleteDialog">
              <Trash2 class="w-4 h-4"/>
              Delete Product
            </Button>
          </div>

          <Separator/>

          <div class="grid grid-cols-3 gap-6">
            <div>
              <p class="text-sm text-muted-foreground mb-1">Price</p>
              <p class="text-3xl font-bold text-foreground">
                ${{ product.price.toFixed(2) }}
              </p>
              <p v-if="product.discountPercentage > 0" class="text-sm text-green-600 mt-1">
                {{ product.discountPercentage }}% off
              </p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Category</p>
              <Badge variant="outline" class="rounded-lg font-normal" :class="getCategoryColor(product.category)">
                {{ formatCategoryName(product.category) }}
              </Badge>
            </div>
          </div>

          <div>
            <p class="text-sm text-muted-foreground my-2">Stock</p>
            <div class="flex items-center gap-2">
              <Badge variant="secondary" class="font-normal text-primary/80" :class="getStockBadgeBg">
                {{ product.availabilityStatus }}
              </Badge>
              <span class="text-sm font-normal">{{ product.stock }} units</span>
            </div>
          </div>

          <Separator/>

          <!-- Admin Information -->
          <p class="text-base my-4">Product Information</p>
          <CardContent class="space-y-3 pl-2">
            <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-muted-foreground">
                  <Tag class="w-4 h-4"/>
                  SKU
                </span>
              <span class="font-medium">{{ product.sku }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-muted-foreground">
                  <Barcode class="w-4 h-4"/>
                  Barcode
                </span>
              <span class="font-medium">{{ product.meta.barcode }}</span>
            </div>
            <div v-if="product.brand" class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-muted-foreground">
                  <Package class="w-4 h-4"/>
                  Brand
                </span>
              <span class="font-medium">{{ product.brand }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-muted-foreground">
                  <Weight class="w-4 h-4"/>
                  Weight
                </span>
              <span class="font-medium">{{ product.weight }} kg</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-muted-foreground">
                  <Ruler class="w-4 h-4"/>
                  Dimensions
                </span>
              <span class="font-medium">
                  {{ product.dimensions.width }} × {{ product.dimensions.height }} × {{ product.dimensions.depth }} cm
                </span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-muted-foreground">
                  <Truck class="w-4 h-4"/>
                  Shipping
                </span>
              <span class="font-medium">{{ product.shippingInformation }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-muted-foreground">
                  <Calendar class="w-4 h-4"/>
                  Warranty
                </span>
              <span class="font-medium">{{ product.warrantyInformation }}</span>
            </div>
          </CardContent>
        </div>
      </div>

      <Separator/>


      <!-- Customer Reviews Section -->
      <div v-if="product.reviews && product.reviews.length > 0" class="mt-4">
        <p class="text-xl my-4">Customer Reviews</p>
        <!-- Rating Overview -->
        <Card class="border-muted shadow-none mb-4 relative">
          <Button
            variant="link"
            size="sm"
            class="text-primary absolute -top-8 right-4 text-sm font-light"
            @click="showAllReviews = true"
          >
            View All Reviews
          </Button>
          <CardContent class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="flex items-start gap-8">
              <div class="text-center">
                <div class="text-6xl font-normal text-foreground mb-2">
                  {{ product.rating.toFixed(1) }}
                </div>
                <div class="flex items-center justify-center gap-1 mb-2">
                  <Star
                      v-for="star in 5"
                      :key="star"
                      :class="[
                      'w-5 h-5',
                      star <= Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : star - 0.5 <= product.rating
                        ? 'fill-yellow-400/50 text-yellow-400'
                        : 'fill-muted text-muted'
                    ]"
                  />
                </div>
                <p class="text-sm text-muted-foreground">
                  Based on {{ product.reviews.length }} reviews
                </p>
              </div>

              <div class="flex-1 space-y-2">
                <div
                    v-for="{ rating, percentage } in ratingDistribution"
                    :key="rating"
                    class="flex items-center gap-3"
                >
                  <span class="text-sm w-3">{{ rating }}</span>
                  <Progress :model-value="percentage"/>
                  <span class="text-sm text-muted-foreground w-10 text-right">
                    {{ percentage }}%
                  </span>
                </div>
              </div>
            </div>
            <ReviewCarousel :reviews="product.reviews"/>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="px-8 pb-8">
      <div class="text-center py-12">
        <p class="text-muted-foreground">Product not found</p>
        <Button @click="router.push('/products')" class="mt-4">
          Back to Products
        </Button>
      </div>
    </div>

    <!-- Reviews Dialog -->
    <ReviewsDialog
      v-if="product?.reviews"
      :reviews="product.reviews"
      v-model:open="showAllReviews"
    />

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
            Are you sure you want to delete "{{ product?.title }}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-4 sm:gap-2">
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

