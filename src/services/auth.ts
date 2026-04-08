import type { AuthUser } from '@/types/models';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '@/services/firebase';

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
  };
}

export async function registerWithEmail(input: RegisterInput): Promise<AuthUser> {
  void input;
  throw new Error('TODO: implement registerWithEmail using Firebase Auth.');
}

export async function loginWithEmail(input: LoginInput): Promise<AuthUser> {
  const credentials = await signInWithEmailAndPassword(firebaseAuth, input.email, input.password);
  return mapFirebaseUser(credentials.user);
}

export async function logoutCurrentUser(): Promise<void> {
  throw new Error('TODO: implement logoutCurrentUser using Firebase Auth.');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (firebaseAuth.currentUser) {
    return mapFirebaseUser(firebaseAuth.currentUser);
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user) => {
        unsubscribe();
        resolve(user ? mapFirebaseUser(user) : null);
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );
  });
}
