import type { AuthUser } from '@/types/models';

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerWithEmail(input: RegisterInput): Promise<AuthUser> {
  void input;
  throw new Error('TODO: implement registerWithEmail using Firebase Auth.');
}

export async function loginWithEmail(input: LoginInput): Promise<AuthUser> {
  void input;
  throw new Error('TODO: implement loginWithEmail using Firebase Auth.');
}

export async function logoutCurrentUser(): Promise<void> {
  throw new Error('TODO: implement logoutCurrentUser using Firebase Auth.');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // TODO: return current auth user from Firebase and map to AuthUser.
  return null;
}
