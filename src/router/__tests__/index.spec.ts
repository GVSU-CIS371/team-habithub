import { createPinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';

const { useAuthStoreMock } = vi.hoisted(() => ({
  useAuthStoreMock: vi.fn(),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: useAuthStoreMock,
}));

vi.mock('@/services/firebase', () => ({
  firebaseAuth: {},
  firestoreDb: {},
}));

import { setupAuthGuard } from '@/router';

const DummyView = { template: '<div />' };

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/auth',
        name: 'auth',
        component: DummyView,
        meta: { public: true },
      },
      {
        path: '/habits',
        name: 'habits',
        component: DummyView,
        meta: { requiresAuth: true },
      },
    ],
  });
}

describe('router auth guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes auth and redirects unauthenticated users to auth route', async () => {
    const authStore = {
      hasCheckedSession: false,
      isAuthenticated: false,
      initializeAuthState: vi.fn(async function initialize() {
        authStore.hasCheckedSession = true;
      }),
    };
    useAuthStoreMock.mockReturnValue(authStore);

    const router = createTestRouter();
    const pinia = createPinia();
    setupAuthGuard(router, pinia);

    await router.push('/habits');

    expect(authStore.initializeAuthState).toHaveBeenCalledTimes(1);
    expect(router.currentRoute.value.name).toBe('auth');
  });

  it('redirects authenticated users away from auth route', async () => {
    const authStore = {
      hasCheckedSession: true,
      isAuthenticated: true,
      initializeAuthState: vi.fn(),
    };
    useAuthStoreMock.mockReturnValue(authStore);

    const router = createTestRouter();
    const pinia = createPinia();
    setupAuthGuard(router, pinia);

    await router.push('/auth');

    expect(authStore.initializeAuthState).not.toHaveBeenCalled();
    expect(router.currentRoute.value.name).toBe('habits');
  });

  it('allows authenticated users to visit protected routes', async () => {
    const authStore = {
      hasCheckedSession: true,
      isAuthenticated: true,
      initializeAuthState: vi.fn(),
    };
    useAuthStoreMock.mockReturnValue(authStore);

    const router = createTestRouter();
    const pinia = createPinia();
    setupAuthGuard(router, pinia);

    await router.push('/habits');

    expect(router.currentRoute.value.name).toBe('habits');
  });
});
