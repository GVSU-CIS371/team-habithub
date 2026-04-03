import { defineStore } from 'pinia';
import type { AuthUser } from '@/types/models';
import {
  getCurrentUser,
  loginWithEmail,
  logoutCurrentUser,
  registerWithEmail,
  type LoginInput,
  type RegisterInput,
} from '@/services/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  hasCheckedSession: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    hasCheckedSession: false,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
  },
  actions: {
    async initializeAuthState(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.user = await getCurrentUser();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to initialize auth state.';
      } finally {
        this.loading = false;
        this.hasCheckedSession = true;
      }
    },
    async register(input: RegisterInput): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.user = await registerWithEmail(input);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Registration failed.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async login(input: LoginInput): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.user = await loginWithEmail(input);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Login failed.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async logout(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await logoutCurrentUser();
        this.user = null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Logout failed.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
