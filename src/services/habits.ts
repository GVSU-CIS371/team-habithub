import type { EntityId, Habit } from '@/types/models';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firebaseAuth, firestoreDb } from '@/services/firebase';

export interface CreateHabitInput {
  title: string;
  description: string;
  tags: string[];
  from_template_id?: EntityId | null;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  tags?: string[];
  archived?: boolean;
}

function requireCurrentUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('You must be logged in to manage habits.');
  }

  return uid;
}

function mapHabitDoc(habitId: string, data: Record<string, unknown>): Habit {
  return {
    id: habitId,
    owner_id: data.owner_id as string,
    title: data.title as string,
    description: data.description as string,
    tags: (data.tags as string[]) ?? [],
    from_template_id: (data.from_template_id as string | null) ?? null,
    archived: (data.archived as boolean) ?? false,
    created_at: data.created_at as number,
  };
}

export async function listHabitsForCurrentUser(): Promise<Habit[]> {
  const ownerId = requireCurrentUid();
  const habitsRef = collection(firestoreDb, 'habits');
  const habitsQuery = query(habitsRef, where('owner_id', '==', ownerId));
  const snapshot = await getDocs(habitsQuery);

  return snapshot.docs
    .map((habitDoc) => {
      return mapHabitDoc(habitDoc.id, habitDoc.data() as Record<string, unknown>);
    })
    .sort((a, b) => b.created_at - a.created_at);
}

export async function getHabitById(habitId: EntityId): Promise<Habit | null> {
  const ownerId = requireCurrentUid();
  const habitRef = doc(firestoreDb, 'habits', habitId);
  const snapshot = await getDoc(habitRef);

  if (!snapshot.exists()) {
    return null;
  }

  const habit = mapHabitDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
  if (habit.owner_id !== ownerId) {
    return null;
  }

  return habit;
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const ownerId = requireCurrentUid();
  const createdAt = Date.now();
  const payload = {
    owner_id: ownerId,
    title: input.title,
    description: input.description,
    tags: input.tags,
    from_template_id: input.from_template_id ?? null,
    archived: false,
    created_at: createdAt,
  };

  const habitsRef = collection(firestoreDb, 'habits');
  const docRef = await addDoc(habitsRef, payload);

  return {
    id: docRef.id,
    ...payload,
  };
}

export async function updateHabit(habitId: EntityId, input: UpdateHabitInput): Promise<Habit> {
  const existing = await getHabitById(habitId);
  if (!existing) {
    throw new Error('Habit not found.');
  }

  const updates: UpdateHabitInput = {};
  if (input.title !== undefined) {
    updates.title = input.title;
  }
  if (input.description !== undefined) {
    updates.description = input.description;
  }
  if (input.tags !== undefined) {
    updates.tags = input.tags;
  }
  if (input.archived !== undefined) {
    updates.archived = input.archived;
  }

  const habitRef = doc(firestoreDb, 'habits', habitId);
  if (Object.keys(updates).length > 0) {
    await updateDoc(habitRef, updates as Record<string, unknown>);
  }

  return {
    ...existing,
    ...updates,
  };
}

export async function deleteHabit(habitId: EntityId): Promise<void> {
  const existing = await getHabitById(habitId);
  if (!existing) {
    throw new Error('Habit not found.');
  }

  const habitRef = doc(firestoreDb, 'habits', habitId);
  await deleteDoc(habitRef);
}
