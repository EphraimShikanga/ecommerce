<script setup lang="ts">
import { ref, computed } from 'vue'
import { Package, Search, Bell } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')

// Get user info
const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value) return 'U'
  const firstName = user.value.firstName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

// Handle search
const handleSearch = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && searchQuery.value.trim()) {
    // Navigate to products page with search query
    router.push({
      path: '/products',
      query: { search: searchQuery.value }
    })
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background">
    <!-- Header -->
    <header class="bg-card px-8 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Package class="w-6 h-6 text-primary" />
          <h1 class="text-xl font-bold text-foreground">Product Management</h1>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              @keydown="handleSearch"
              class="pl-10 pr-4 py-2 bg-muted rounded-lg border-0 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            class="bg-primary text-primary-foreground hover:bg-primary/90"
            @click="router.push('/products/new')"
          >
            Add Product
          </Button>
          <Button variant="ghost" size="icon">
            <Bell class="w-5 h-5" />
          </Button>
          <Avatar class="w-10 h-10">
            <AvatarImage v-if="user?.image" :src="user.image" :alt="user.firstName" />
            <AvatarFallback class="bg-primary text-primary-foreground">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

