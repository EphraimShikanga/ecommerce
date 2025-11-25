<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/30">
    <div class="w-full max-w-md space-y-8 px-4">
      <div class="flex flex-col items-center justify-center space-y-2">
        <div class="flex items-center gap-2 text-primary">
          <Database class="h-8 w-8"/>
          <span class="text-2xl font-semibold">Platform Logo</span>
        </div>
      </div>

      <div class="rounded-lg bg-card p-8 shadow-lg">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Sign in to manage your products.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="username">Email or Username</Label>
            <Input
                id="username"
                type="text"
                placeholder="you@example.com"
                v-model="username"
                :disabled="isLoading"
                autocomplete="username"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <div class="relative">
              <Input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  v-model="password"
                  :disabled="isLoading"
                  class="pr-10"
                  autocomplete="current-password"
              />
              <button
                  type="button"
                  @click="toggleShowPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  :aria-pressed="showPassword"
                  :disabled="isLoading"
              >
                <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4"/>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Checkbox id="remember" v-model="rememberMe"/>
              <label
                  for="remember"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <a
                href="#"
                class="text-sm font-medium text-primary hover:underline"
                @click.prevent="onForgotPassword"
            >
              Forgot Password?
            </a>
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>
      </div>

      <p class="text-center text-sm text-muted-foreground">
        © 2024 Platform Inc. All Rights Reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/auth';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Database, Eye, EyeOff} from 'lucide-vue-next';
import {toast} from 'vue-sonner';

/**
 * Login page converted from the React implementation you provided.
 *
 * Notes / assumptions:
 * - UI primitives (Button, Input, Label, Checkbox) are provided by your shadcn/vue setup.
 * - Auth store is the Pinia store you asked for (src/stores/auth.ts) and exposes `login()` and `isAuthenticated`.
 * - Router guard also exists (we created that previously).
 */

// local reactive state
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);

const router = useRouter();
const auth = useAuthStore();

// If user somehow lands on /login while already authenticated, redirect immediately.
// (Router global guard should normally prevent this, but this is a safe-guard.)
onMounted(() => {
  if (auth.isAuthenticated) {
    router.replace({path: '/products'});
  }
});

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

function onForgotPassword() {
  toast.info('Password reset functionality coming soon');
}

/**
 * handleSubmit
 * - validates inputs
 * - calls auth.login(username, password)
 * - uses router.push('/products') on success
 * - shows toast messages on failure/success
 */
async function handleSubmit() {
  if (!username.value.trim() || !password.value.trim()) {
    toast.error('Please enter both username and password');
    return;
  }

  isLoading.value = true;

  try {
    // The Pinia auth store's `login` should return the user object (per your choice 3b)
    await auth.login(username.value.trim(), password.value);
    toast.success('Login successful!');
    // Navigate to products page after successful login
    await router.push({path: '/products'});
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
    toast.error(message);
  } finally {
    isLoading.value = false;
  }
}
</script>
