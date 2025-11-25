<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package } from 'lucide-vue-next'

const router = useRouter()

/**
 * Navigate back to products page
 */
const goToProducts = () => {
  router.push('/products')
}

/**
 * Go back to previous page
 */
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <!-- 404 Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
          <Package class="w-12 h-12 text-primary" />
        </div>
        <h1 class="text-6xl font-bold text-foreground mb-2">404</h1>
        <h2 class="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p class="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          @click="goBack"
          class="gap-2"
        >
          <ArrowLeft class="w-4 h-4" />
          Go Back
        </Button>
        <Button
          @click="goToProducts"
          class="gap-2 bg-primary hover:bg-primary/90"
        >
          <Package class="w-4 h-4" />
          Go to Products
        </Button>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 pt-8 border-t border-border">
        <p class="text-sm text-muted-foreground mb-4">
          Need help? Here are some useful links:
        </p>
        <div class="flex flex-wrap gap-4 justify-center text-sm">
          <button
            @click="router.push('/products')"
            class="text-primary hover:underline"
          >
            Products
          </button>
          <button
            @click="router.push('/dashboard')"
            class="text-primary hover:underline"
          >
            Dashboard
          </button>
          <button
            @click="router.push('/login')"
            class="text-primary hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

