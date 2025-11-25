import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '@/stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login',
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/pages/login/index.vue'),
        },
        {
            path: '/dashboard',
            component: () => import('@/layouts/DashboardLayout.vue'),
            meta: {requiresAuth: true},
        },
        {
            path: '/products',
            component: () => import('@/layouts/DashboardLayout.vue'),
            meta: {requiresAuth: true},
            children: [
                {
                    path: '',
                    name: 'Products',
                    component: () => import('@/pages/products/index.vue'),
                    meta: {requiresAuth: true},
                },
            ],
        },
        {
            path: '/products/new',
            name: 'product-new',
            component: () => import('@/pages/products/new.vue'),
            meta: {requiresAuth: true},
        },
        {
            path: '/products/edit/:id',
            name: 'product-edit',
            component: () => import('@/pages/products/new.vue'),
            meta: {requiresAuth: true},
        },
        {
            path: '/products/:id',
            component: () => import('@/layouts/HeaderLayout.vue'),
            meta: {requiresAuth: true},
            children: [
                {
                    path: '',
                    name: 'product-details',
                    component: () => import('@/pages/products/details.vue'),
                    meta: {requiresAuth: true},
                },
            ],
        },
        {
            path: '/orders',
            component: () => import('@/layouts/DashboardLayout.vue'),
            meta: {requiresAuth: true},
        },
        {
            path: '/customers',
            component: () => import('@/layouts/DashboardLayout.vue'),
            meta: {requiresAuth: true},
        },
        {
            path: '/settings',
            component: () => import('@/layouts/DashboardLayout.vue'),
            meta: {requiresAuth: true},
        }
    ],
});

router.beforeEach((to, _ , next) => {
    const auth = useAuthStore();

    // If user is logged in, prevent accessing login page
    if (to.path === '/login' && auth.isAuthenticated) {
        return next('/products');
    }

    // If route requires auth and user is not authenticated
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next('/login');
    }

    return next();
});

export default router;
