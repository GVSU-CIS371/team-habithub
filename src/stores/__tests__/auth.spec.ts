import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/auth';

describe('auth store scaffold', () => {
  it('starts unauthenticated by default', () => {
    setActivePinia(createPinia());
    const store = useAuthStore();

    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.hasCheckedSession).toBe(false);
  });
});
