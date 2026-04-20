import type { EntityId, HabitLog, HabitLogStatus } from '@/types/models';
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

export interface CreateLogInput {
  habit_id: EntityId;
  date: string;
  note?: string;
}

export interface UpdateLogInput {
  date?: string;
  note?: string;
}

const VALID_LOG_STATUSES: readonly HabitLogStatus[] = ['completed'];

function requireCurrentUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('You must be logged in to manage habit logs.');
  }

  return uid;
}

function normalizeLogStatus(status: unknown): HabitLogStatus {
  if (typeof status === 'string' && VALID_LOG_STATUSES.includes(status as HabitLogStatus)) {
    return status as HabitLogStatus;
  }

  return 'completed';
}

function mapLogDoc(logId: string, data: Record<string, unknown>): HabitLog {
  return {
    id: logId,
    owner_id: data.owner_id as string,
    habit_id: data.habit_id as string,
    date: data.date as string,
    status: normalizeLogStatus(data.status),
    note: (data.note as string) ?? '',
    created_at: data.created_at as number,
  };
}

function assertDateInput(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Date must be in YYYY-MM-DD format.');
  }
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

async function getOwnedLogById(logId: EntityId): Promise<HabitLog | null> {
  const ownerId = requireCurrentUid();
  const logRef = doc(firestoreDb, 'habit_logs', logId);
  const snapshot = await getDoc(logRef);

  if (!snapshot.exists()) {
    return null;
  }

  const log = mapLogDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
  if (log.owner_id !== ownerId) {
    return null;
  }

  return log;
}

export async function listLogsByHabit(habitId: EntityId): Promise<HabitLog[]> {
  const ownerId = requireCurrentUid();
  const logsRef = collection(firestoreDb, 'habit_logs');
  const logsQuery = query(
    logsRef,
    where('owner_id', '==', ownerId),
    where('habit_id', '==', habitId),
  );
  const snapshot = await getDocs(logsQuery);

  return snapshot.docs
    .map((logDoc) => {
      return mapLogDoc(logDoc.id, logDoc.data() as Record<string, unknown>);
    })
    .sort((a, b) => {
      if (a.date === b.date) {
        return b.created_at - a.created_at;
      }

      return a.date < b.date ? 1 : -1;
    });
}

export async function createLog(input: CreateLogInput): Promise<HabitLog> {
  const ownerId = requireCurrentUid();
  assertDateInput(input.date);

  const createdAt = Date.now();
  const payload = {
    owner_id: ownerId,
    habit_id: input.habit_id,
    date: input.date,
    status: 'completed' as const,
    note: input.note ?? '',
    created_at: createdAt,
  };

  const logsRef = collection(firestoreDb, 'habit_logs');
  const docRef = await addDoc(logsRef, payload);

  return {
    id: docRef.id,
    ...payload,
  };
}

export async function completeHabitToday(habitId: EntityId, note?: string): Promise<HabitLog> {
  return createLog({
    habit_id: habitId,
    date: getTodayDateString(),
    note,
  });
}

export async function updateLog(logId: EntityId, input: UpdateLogInput): Promise<HabitLog> {
  const existing = await getOwnedLogById(logId);
  if (!existing) {
    throw new Error('Habit log not found.');
  }

  const updates: UpdateLogInput = {};
  if (input.date !== undefined) {
    assertDateInput(input.date);
    updates.date = input.date;
  }
  if (input.note !== undefined) {
    updates.note = input.note;
  }

  if (Object.keys(updates).length > 0) {
    const logRef = doc(firestoreDb, 'habit_logs', logId);
    await updateDoc(logRef, updates as Record<string, unknown>);
  }

  return {
    ...existing,
    ...updates,
  };
}

export async function deleteLog(logId: EntityId): Promise<void> {
  const existing = await getOwnedLogById(logId);
  if (!existing) {
    throw new Error('Habit log not found.');
  }

  const logRef = doc(firestoreDb, 'habit_logs', logId);
  await deleteDoc(logRef);
}
