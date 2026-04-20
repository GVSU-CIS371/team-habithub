import type { AuthUser } from '@/types/models';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseAuth, firestoreDb } from '@/services/firebase';

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

interface UserProfileDoc {
  display_name: string;
  photo_url: string;
  created_at: number;
}

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
  };
}

async function upsertUserProfile(
  uid: string,
  displayName: string | undefined,
  photoUrl: string | undefined,
): Promise<void> {
  const userRef = doc(firestoreDb, 'users', uid);
  const existingSnapshot = await getDoc(userRef);
  const existingData = existingSnapshot.exists()
    ? (existingSnapshot.data() as Partial<UserProfileDoc>)
    : null;

  const createdAt =
    typeof existingData?.created_at === 'number' ? existingData.created_at : Date.now();
  const normalizedDisplayName = displayName?.trim() || existingData?.display_name || '';
  const normalizedPhotoUrl = photoUrl?.trim() || existingData?.photo_url || '';

  await setDoc(
    userRef,
    {
      display_name: normalizedDisplayName,
      photo_url: normalizedPhotoUrl,
      created_at: createdAt,
    },
    { merge: true },
  );
}

export async function registerWithEmail(input: RegisterInput): Promise<AuthUser> {
  const credentials = await createUserWithEmailAndPassword(
    firebaseAuth,
    input.email,
    input.password,
  );
  const { user } = credentials;

  if (input.displayName?.trim()) {
    await updateProfile(user, { displayName: input.displayName.trim() });
  }

  await upsertUserProfile(user.uid, input.displayName, user.photoURL ?? undefined);

  return mapFirebaseUser(user);
}

export async function loginWithEmail(input: LoginInput): Promise<AuthUser> {
  const credentials = await signInWithEmailAndPassword(firebaseAuth, input.email, input.password);
  return mapFirebaseUser(credentials.user);
}

export async function logoutCurrentUser(): Promise<void> {
  await signOut(firebaseAuth);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (firebaseAuth.currentUser) {
    return mapFirebaseUser(firebaseAuth.currentUser);
  }

  return new Promise((resolve, reject) => {
    let unsubscribe: () => void = () => {};
    unsubscribe = onAuthStateChanged(
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
