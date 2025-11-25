<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router'
import {LayoutDashboard, Package, Settings, ShoppingCart, Users, LogOut} from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent, SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {useAuthStore} from '@/stores/auth'
import {useSidebar} from '@/components/ui/sidebar'

const {open} = useSidebar()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/login')
};

// Menu items.
const items = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    path: '/products',
    icon: Package,
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    path: '/customers',
    icon: Users,
  }
]

const isActive = (path: string) => {
  return route.path.startsWith(path)
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title"
                             class="w-full flex items-center rounded-xl text-md font transition-colors">
              <SidebarMenuButton
                  as-child
                  :tooltip="item.title"
                  :class="[
                  'w-full flex items-center gap-2 py-6 hover:bg-primary/5 hover:text-primary/70',
                  isActive(item.path) ? 'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary' : ''
                ]"
              >
                <router-link :to="item.path">
                  <component :is="item.icon"/>
                  <span>{{ item.title }}</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="space-y-2 border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem class="w-full flex items-center rounded-xl text-md font transition-colors">
          <SidebarMenuButton
              as-child
              tooltip="Settings"
              :class="[
              'w-full flex items-center gap-2 py-6 hover:bg-primary/5 hover:text-primary/70',
              isActive('/settings') ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : ''
            ]"
          >
            <router-link to="/settings">
              <Settings/>
              <span>Settings</span>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarMenuButton
          @click="logout"
          :class="['w-full p-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl hover:text-primary-foreground', open ? 'flex justify-center' : '']"
      >
        <LogOut class="w-4 h-4"/>
        Logout
      </SidebarMenuButton>
    </SidebarFooter>
  </Sidebar>
</template>
