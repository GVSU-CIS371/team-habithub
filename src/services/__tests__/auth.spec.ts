import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockUpdateProfile,
  mockOnAuthStateChanged,
  mockDoc,
  mockGetDoc,
  mockSetDoc,
  firebaseAuthMock,
} = vi.hoisted(() => ({
  mockCreateUserWithEmailAndPassword: vi.fn(),
  mockSignInWithEmailAndPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockUpdateProfile: vi.fn(),
  mockOnAuthStateChanged: vi.fn(),
  mockDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockSetDoc: vi.fn(),
  firebaseAuthMock: {
    currentUser: null as {
      uid: string;
      email: string | null;
      photoURL?: string | null;
    } | null,
  },
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  updateProfile: mockUpdateProfile,
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
}));

vi.mock('@/services/firebase', () => ({
  firebaseAuth: firebaseAuthMock,
  firestoreDb: { _name: 'db' },
}));

import {
  getCurrentUser,
  loginWithEmail,
  logoutCurrentUser,
  registerWithEmail,
} from '@/services/auth';

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebaseAuthMock.currentUser = null;
    mockDoc.mockImplementation((_, collectionName: string, uid: string) => ({
      id: `${collectionName}/${uid}`,
    }));
  });

  it('registers and creates a profile document', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'u1',
        email: 'joshua@example.com',
        photoURL: null,
      },
    });
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    });

    const result = await registerWithEmail({
      email: 'joshua@example.com',
      password: 'password123',
      displayName: 'Joshua',
    });

    expect(result).toEqual({ uid: 'u1', email: 'joshua@example.com' });
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      firebaseAuthMock,
      'joshua@example.com',
      'password123',
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(expect.any(Object), {
      displayName: 'Joshua',
    });
    expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'users', 'u1');
    expect(mockSetDoc).toHaveBeenCalledWith(
      { id: 'users/u1' },
      expect.objectContaining({
        display_name: 'Joshua',
        photo_url: '',
      }),
      { merge: true },
    );
  });

  it('preserves existing profile created_at during registration', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'u2',
        email: 'u2@example.com',
        photoURL: 'https://img.example/pic.png',
      },
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        created_at: 1712345678901,
        display_name: 'Existing Name',
        photo_url: 'https://img.example/old.png',
      }),
    });

    await registerWithEmail({
      email: 'u2@example.com',
      password: 'password123',
    });

    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockSetDoc).toHaveBeenCalledWith(
      { id: 'users/u2' },
      {
        display_name: 'Existing Name',
        photo_url: 'https://img.example/pic.png',
        created_at: 1712345678901,
      },
      { merge: true },
    );
  });

  it('logs in with email and password', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u3', email: 'u3@example.com' },
    });

    const result = await loginWithEmail({ email: 'u3@example.com', password: 'pw' });

    expect(result).toEqual({ uid: 'u3', email: 'u3@example.com' });
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      firebaseAuthMock,
      'u3@example.com',
      'pw',
    );
  });

  it('logs out current user', async () => {
    await logoutCurrentUser();

    expect(mockSignOut).toHaveBeenCalledWith(firebaseAuthMock);
  });

  it('returns current user immediately when available', async () => {
    firebaseAuthMock.currentUser = { uid: 'u4', email: 'u4@example.com' };

    await expect(getCurrentUser()).resolves.toEqual({ uid: 'u4', email: 'u4@example.com' });
    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
  });

  it('resolves user via auth state listener when no current user is set', async () => {
    mockOnAuthStateChanged.mockImplementation((_, onUserChanged) => {
      onUserChanged({ uid: 'u5', email: 'u5@example.com' });
      return vi.fn();
    });

    await expect(getCurrentUser()).resolves.toEqual({ uid: 'u5', email: 'u5@example.com' });
  });

  it('rejects when auth state listener emits an error', async () => {
    mockOnAuthStateChanged.mockImplementation((_, _onUserChanged, onError) => {
      onError(new Error('listener failed'));
      return vi.fn();
    });

    await expect(getCurrentUser()).rejects.toThrow('listener failed');
  });
});
