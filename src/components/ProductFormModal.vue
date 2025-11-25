<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCategories } from '@/composables/useCategories'
import type { Product } from '@/types/product'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
  product?: Product | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'submit': [product: Product]
}>()

const router = useRouter()
const productStore = useProductStore()
const { categories } = useCategories()

const isEditing = computed(() => !!props.product)

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

// Format category name for display
const formatCategoryName = (category: string): string => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Reset form function (defined before watch to avoid hoisting issues)
const resetForm = () => {
  formData.value = {
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
  }
  errors.value = {}
  imageFiles.value = []
}

// Watch for product changes (edit mode)
watch(() => props.product, (product) => {
  if (product) {
    formData.value = {
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      discountPercentage: product.discountPercentage || 0,
      brand: product.brand || '',
      sku: product.sku || '',
      weight: product.weight || 0,
      width: product.dimensions?.width || 0,
      height: product.dimensions?.height || 0,
      depth: product.dimensions?.depth || 0,
      warrantyInformation: product.warrantyInformation || '',
      shippingInformation: product.shippingInformation || '',
      availabilityStatus: product.availabilityStatus || 'In Stock',
      returnPolicy: product.returnPolicy || '',
      minimumOrderQuantity: product.minimumOrderQuantity || 1,
      tags: product.tags?.join(', ') || '',
    }
  } else {
    resetForm()
  }
}, { immediate: true })


// Validate form
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

  if (formData.value.price < 0) {
    errors.value.price = 'Price must be positive'
  }

  if (formData.value.stock < 0) {
    errors.value.stock = 'Stock must be positive'
  }

  if (formData.value.discountPercentage < 0 || formData.value.discountPercentage > 100) {
    errors.value.discountPercentage = 'Discount must be between 0 and 100'
  }

  return Object.keys(errors.value).length === 0
}

// Handle file change
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    imageFiles.value = Array.from(target.files)
  }
}

// Handle form submit
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

  if (isEditing.value && props.product?.id) {
    // Update existing product
    const updated = await productStore.updateProduct(props.product.id, productData)

    if (updated) {
      toast.success('Product updated successfully')
      emit('update:open', false)
      emit('submit', updated)
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
          emit('update:open', false)
          emit('submit', newProduct)
          // Redirect to product details or products list
          router.push('/products')
          return 'Product added successfully'
        }
        // return 'Product added'
      },
      error: 'Failed to add product',
    })
  }
}

// Handle dialog close
const handleOpenChange = (open: boolean) => {
  emit('update:open', open)
  if (!open) {
    resetForm()
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-3xl max-h-[90vh] overflow-y-auto"
      @interact-outside="(event: any) => {
        const target = event.target as HTMLElement;
        if (target?.closest('[data-sonner-toaster]')) return event.preventDefault()
      }"
    >
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold">
          {{ isEditing ? 'Edit Product' : 'Add New Product' }}
        </DialogTitle>
        <p class="text-muted-foreground">
          {{ isEditing
            ? 'Update the product details below.'
            : 'Enter the details below to add a new item to your inventory.'
          }}
        </p>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Product Information -->
        <div class="space-y-4">
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
        </div>

        <!-- Pricing & Inventory -->
        <div class="space-y-4">
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
                <SelectValue placeholder="Select a category" />
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
        </div>

        <!-- Product Details -->
        <div class="space-y-4">
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
        </div>

        <!-- Media -->
        <div class="space-y-4">
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
              <Upload class="w-12 h-12 text-muted-foreground mb-4" />
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
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            @click="handleOpenChange(false)"
          >
            Cancel
          </Button>
          <Button type="submit" class="bg-primary hover:bg-primary/90">
            {{ isEditing ? 'Update Product' : 'Save Product' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

