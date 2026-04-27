import type { Pinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/templates',
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { public: true },
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('@/views/TemplatesView.vue'),
      meta: { public: true },
    },
    {
      path: '/templates/:id',
      name: 'template-detail',
      component: () => import('@/views/TemplateDetailView.vue'),
      props: true,
      meta: { public: true },
    },
    {
      path: '/habits',
      name: 'habits',
      component: () => import('@/views/MyHabitsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/habits/:id',
      name: 'habit-detail',
      component: () => import('@/views/HabitDetailView.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
  ],
});

export function setupAuthGuard(targetRouter: typeof router, pinia: Pinia): void {
  targetRouter.beforeEach(async (to) => {
    const authStore = useAuthStore(pinia);

    if (to.meta.public) {
      return true;
    }

    if (!authStore.hasCheckedSession) {
      await authStore.initializeAuthState();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'auth' };
    }

    return true;
  });
}

export default router;