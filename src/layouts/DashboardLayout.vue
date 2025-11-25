<script setup lang="ts">
import { computed } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Get user info
const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value) return 'U'
  const firstName = user.value.firstName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="flex-1 w-full">
      <!-- Header -->
      <header class="bg-card px-8 py-4 sticky top-0 z-40">
        <div class="flex items-center justify-between">
          <SidebarTrigger />

          <div class="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell class="w-5 h-5" />
            </Button>
            <Avatar class="w-10 h-10">
              <AvatarImage v-if="user?.image" :src="user.image" :alt="user?.firstName" />
              <AvatarFallback class="bg-primary text-primary-foreground">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <RouterView />
    </main>
  </SidebarProvider>
</template>
