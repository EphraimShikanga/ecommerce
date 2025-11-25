<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCategories } from '@/composables/useCategories'
import { useCategoryColors } from '@/composables/useCategoryColors'
import type { Product } from '@/types/product'
import { VALIDATION } from '@/lib/constants'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Upload, ArrowLeft} from 'lucide-vue-next'
import {toast} from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()

// Composables
const { categories } = useCategories()
const { formatCategoryName } = useCategoryColors()

// Check if editing mode (if product ID in route params)
// Route can be /products/edit/:id or /products/:id/edit
const productId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEditing = computed(() => !!productId.value)
const product = ref<Product | null>(null)

// Form data
const formData = ref({
  title: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
  discountPercentage: 0,
  brand: '',
  sku: '',
  weight: 0,
  width: 0,
  height: 0,
  depth: 0,
  warrantyInformation: '',
  shippingInformation: '',
  availabilityStatus: 'In Stock',
  returnPolicy: '',
  minimumOrderQuantity: 1,
  tags: '',
})

// Form errors
const errors = ref<Record<string, string>>({})

// Image files
const imageFiles = ref<File[]>([])

/**
 * Load product data if in edit mode
 */
onMounted(async () => {
  if (isEditing.value && productId.value) {
    const loadedProduct = await productStore.fetchSingleProduct(productId.value)
    if (loadedProduct) {
      product.value = loadedProduct
      formData.value = {
        title: loadedProduct.title,
        description: loadedProduct.description,
        category: loadedProduct.category,
        price: loadedProduct.price,
        stock: loadedProduct.stock,
        discountPercentage: loadedProduct.discountPercentage || 0,
        brand: loadedProduct.brand || '',
        sku: loadedProduct.sku || '',
        weight: loadedProduct.weight || 0,
        width: loadedProduct.dimensions?.width || 0,
        height: loadedProduct.dimensions?.height || 0,
        depth: loadedProduct.dimensions?.depth || 0,
        warrantyInformation: loadedProduct.warrantyInformation || '',
        shippingInformation: loadedProduct.shippingInformation || '',
        availabilityStatus: loadedProduct.availabilityStatus || 'In Stock',
        returnPolicy: loadedProduct.returnPolicy || '',
        minimumOrderQuantity: loadedProduct.minimumOrderQuantity || VALIDATION.MIN_ORDER_QUANTITY,
        tags: loadedProduct.tags?.join(', ') || '',
      }
    }
  }
})

/**
 * Validate form fields
 */
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Product title is required'
  }

  if (!formData.value.description.trim()) {
    errors.value.description = 'Description is required'
  }

  if (!formData.value.category) {
    errors.value.category = 'Category is required'
  }

  if (formData.value.price < VALIDATION.MIN_PRICE) {
    errors.value.price = 'Price must be positive'
  }

  if (formData.value.stock < VALIDATION.MIN_STOCK) {
    errors.value.stock = 'Stock must be positive'
  }

  if (formData.value.discountPercentage < VALIDATION.MIN_DISCOUNT ||
      formData.value.discountPercentage > VALIDATION.MAX_DISCOUNT) {
    errors.value.discountPercentage = `Discount must be between ${VALIDATION.MIN_DISCOUNT} and ${VALIDATION.MAX_DISCOUNT}`
  }

  return Object.keys(errors.value).length === 0
}

/**
 * Handle file selection for product images
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    imageFiles.value = Array.from(target.files)
  }
}

/**
 * Navigate back to products list
 */
const goBack = () => {
  router.push('/products')
}

/**
 * Handle form submission (create or update product)
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fix the form errors')
    return
  }

  const productData: Partial<Product> = {
    title: formData.value.title,
    description: formData.value.description,
    category: formData.value.category,
    price: formData.value.price,
    stock: formData.value.stock,
    discountPercentage: formData.value.discountPercentage,
    brand: formData.value.brand || undefined,
    sku: formData.value.sku || undefined,
    weight: formData.value.weight || 0,
    dimensions: {
      width: formData.value.width || 0,
      height: formData.value.height || 0,
      depth: formData.value.depth || 0,
    },
    warrantyInformation: formData.value.warrantyInformation || undefined,
    shippingInformation: formData.value.shippingInformation || undefined,
    availabilityStatus: formData.value.availabilityStatus,
    returnPolicy: formData.value.returnPolicy || undefined,
    minimumOrderQuantity: formData.value.minimumOrderQuantity || 1,
    tags: formData.value.tags
        ? formData.value.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [],
  }

  if (isEditing.value && productId.value) {
    // Update existing product
    const updated = await productStore.updateProduct(productId.value, productData)

    if (updated) {
      toast.success('Product updated successfully')
      router.push('/products')
    } else {
      toast.error('Failed to update product')
    }
  } else {
    // Add new product
    const addPromise = productStore.addProduct(productData as Omit<Product, 'id'>)

    toast.promise(addPromise, {
      loading: 'Adding product...',
      success: (newProduct: Product | null) => {
        if (newProduct) {
          router.push('/products')
          return 'Product added successfully'
        }
        return 'Product added'
      },
      error: 'Failed to add product',
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Floating Back Button -->
    <Button
      variant="ghost"
      size="icon"
      @click="goBack"
      class="fixed top-6 left-40 z-50 rounded-full bg-card shadow-lg hover:bg-muted border border-border"
    >
      <ArrowLeft class="w-5 h-5"/>
    </Button>

    <div class="max-w-6xl mx-auto px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground">
          {{ isEditing ? 'Edit Product' : 'Add New Product' }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{
            isEditing
                ? 'Update the product details below.'
                : 'Enter the details below to add a new item to your inventory.'
          }}
        </p>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Product Information -->
        <div class="bg-card rounded-lg border border-border p-6 space-y-4">
          <h3 class="text-lg font-semibold">Product Information</h3>

          <div class="space-y-2">
            <Label for="title">Product Title</Label>
            <Input
                id="title"
                v-model="formData.title"
                placeholder="Enter product title"
            />
            <p v-if="errors.title" class="text-sm text-destructive">
              {{ errors.title }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="description">Product Description</Label>
            <Textarea
                id="description"
                v-model="formData.description"
                placeholder="Provide a detailed description of the product"
                rows="4"
            />
            <p v-if="errors.description" class="text-sm text-destructive">
              {{ errors.description }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="brand">Brand</Label>
              <Input
                  id="brand"
                  v-model="formData.brand"
                  placeholder="Enter brand name"
              />
            </div>

            <div class="space-y-2">
              <Label for="sku">SKU</Label>
              <Input
                  id="sku"
                  v-model="formData.sku"
                  placeholder="Enter SKU"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="tags">Tags</Label>
            <Input
                id="tags"
                v-model="formData.tags"
                placeholder="Enter tags separated by commas"
            />
          </div>
          <!--        </div>-->

          <!-- Pricing & Inventory -->
          <!--        <div class="bg-card rounded-lg border border-border p-6 space-y-4">-->
          <h3 class="text-lg font-semibold">Pricing & Inventory</h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="price">Price</Label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                    id="price"
                    v-model.number="formData.price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    class="pl-7"
                />
              </div>
              <p v-if="errors.price" class="text-sm text-destructive">
                {{ errors.price }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="stock">Stock Quantity</Label>
              <Input
                  id="stock"
                  v-model.number="formData.stock"
                  type="number"
                  placeholder="Enter stock quantity"
              />
              <p v-if="errors.stock" class="text-sm text-destructive">
                {{ errors.stock }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="discountPercentage">Discount Percentage</Label>
              <Input
                  id="discountPercentage"
                  v-model.number="formData.discountPercentage"
                  type="number"
                  step="0.01"
                  placeholder="0"
              />
              <p v-if="errors.discountPercentage" class="text-sm text-destructive">
                {{ errors.discountPercentage }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="minimumOrderQuantity">Minimum Order Quantity</Label>
              <Input
                  id="minimumOrderQuantity"
                  v-model.number="formData.minimumOrderQuantity"
                  type="number"
                  placeholder="1"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="category">Category</Label>
            <Select v-model="formData.category">
              <SelectTrigger>
                <SelectValue placeholder="Select a category"/>
              </SelectTrigger>
              <SelectContent class="bg-popover">
                <SelectItem
                    v-for="cat in categories"
                    :key="cat"
                    :value="cat"
                >
                  {{ formatCategoryName(cat) }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.category" class="text-sm text-destructive">
              {{ errors.category }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="availabilityStatus">Availability Status</Label>
            <Input
                id="availabilityStatus"
                v-model="formData.availabilityStatus"
                placeholder="In Stock"
            />
          </div>
          <!--        </div>-->

          <!-- Product Details -->
          <!--        <div class="bg-card rounded-lg border border-border p-6 space-y-4">-->
          <h3 class="text-lg font-semibold">Product Details</h3>

          <div class="space-y-2">
            <Label for="weight">Weight (kg)</Label>
            <Input
                id="weight"
                v-model.number="formData.weight"
                type="number"
                step="0.01"
                placeholder="0"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="width">Width (cm)</Label>
              <Input
                  id="width"
                  v-model.number="formData.width"
                  type="number"
                  step="0.01"
                  placeholder="0"
              />
            </div>

            <div class="space-y-2">
              <Label for="height">Height (cm)</Label>
              <Input
                  id="height"
                  v-model.number="formData.height"
                  type="number"
                  step="0.01"
                  placeholder="0"
              />
            </div>

            <div class="space-y-2">
              <Label for="depth">Depth (cm)</Label>
              <Input
                  id="depth"
                  v-model.number="formData.depth"
                  type="number"
                  step="0.01"
                  placeholder="0"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="warrantyInformation">Warranty Information</Label>
            <Input
                id="warrantyInformation"
                v-model="formData.warrantyInformation"
                placeholder="e.g., 1 month warranty"
            />
          </div>

          <div class="space-y-2">
            <Label for="shippingInformation">Shipping Information</Label>
            <Input
                id="shippingInformation"
                v-model="formData.shippingInformation"
                placeholder="e.g., Ships in 1 month"
            />
          </div>

          <div class="space-y-2">
            <Label for="returnPolicy">Return Policy</Label>
            <Input
                id="returnPolicy"
                v-model="formData.returnPolicy"
                placeholder="e.g., 30 days return policy"
            />
          </div>
          <!--        </div>-->

          <!-- Media -->
          <!--        <div class="bg-card rounded-lg border border-border p-6 space-y-4">-->
          <h3 class="text-lg font-semibold">Media</h3>

          <div class="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
                type="file"
                multiple
                accept="image/*"
                @change="handleFileChange"
                class="hidden"
                id="file-upload"
            />
            <label
                for="file-upload"
                class="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload class="w-12 h-12 text-muted-foreground mb-4"/>
              <p class="text-sm text-foreground mb-1">
                <span class="text-primary font-medium">Click to upload</span> or
                drag and drop
              </p>
              <p class="text-xs text-muted-foreground">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </label>
            <p v-if="imageFiles.length > 0" class="text-sm text-foreground mt-4">
              {{ imageFiles.length }} file(s) selected
            </p>
          </div>
          <!--        </div>-->

          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <Button
                type="button"
                variant="outline"
                @click="goBack"
            >
              Cancel
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90">
              {{ isEditing ? 'Update Product' : 'Save Product' }}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

