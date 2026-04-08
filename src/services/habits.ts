import type { EntityId, Habit } from '@/types/models';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
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

export async function listHabitsForCurrentUser(): Promise<Habit[]> {
  const ownerId = requireCurrentUid();
  const habitsRef = collection(firestoreDb, 'habits');
  const habitsQuery = query(habitsRef, where('owner_id', '==', ownerId));
  const snapshot = await getDocs(habitsQuery);

  return snapshot.docs
    .map((habitDoc) => {
      const data = habitDoc.data();
      return {
        id: habitDoc.id,
        owner_id: data.owner_id as string,
        title: data.title as string,
        description: data.description as string,
        tags: (data.tags as string[]) ?? [],
        from_template_id: (data.from_template_id as string | null) ?? null,
        archived: (data.archived as boolean) ?? false,
        created_at: data.created_at as number,
      };
    })
    .sort((a, b) => b.created_at - a.created_at);
}

export async function getHabitById(habitId: EntityId): Promise<Habit | null> {
  void habitId;
  throw new Error('TODO: implement getHabitById fetch scoped to owner.');
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
  void habitId;
  void input;
  throw new Error('TODO: implement updateHabit write.');
}

export async function deleteHabit(habitId: EntityId): Promise<void> {
  void habitId;
  throw new Error('TODO: implement deleteHabit write.');
}
