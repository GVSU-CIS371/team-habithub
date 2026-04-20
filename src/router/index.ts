import type { Pinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '@/views/AuthView.vue';
import TemplatesView from '@/views/TemplatesView.vue';
import TemplateDetailView from '@/views/TemplateDetailView.vue';
import MyHabitsView from '@/views/MyHabitsView.vue';
import HabitDetailView from '@/views/HabitDetailView.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/habits',
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: { public: true },
    },
    {
      path: '/templates',
      name: 'templates',
      component: TemplatesView,
      meta: { public: true },
    },
    {
      path: '/templates/:id',
      name: 'template-detail',
      component: TemplateDetailView,
      props: true,
      meta: { public: true },
    },
    {
      path: '/habits',
      name: 'habits',
      component: MyHabitsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/habits/:id',
      name: 'habit-detail',
      component: HabitDetailView,
      props: true,
      meta: { requiresAuth: true },
    },
  ],
});

export function setupAuthGuard(targetRouter: typeof router, pinia: Pinia): void {
  targetRouter.beforeEach(async (to) => {
    const authStore = useAuthStore(pinia);

    if (!authStore.hasCheckedSession) {
      await authStore.initializeAuthState();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'auth' };
    }

    if (to.name === 'auth' && authStore.isAuthenticated) {
      return { name: 'habits' };
    }

    return true;
  });
}

export default router;
