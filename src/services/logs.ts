import type { EntityId, HabitLog } from '@/types/models';

export interface CreateLogInput {
  habit_id: EntityId;
  date: string;
  note?: string;
}

export interface UpdateLogInput {
  date?: string;
  note?: string;
}

export async function listLogsByHabit(habitId: EntityId): Promise<HabitLog[]> {
  void habitId;
  throw new Error('TODO: implement listLogsByHabit query.');
}

export async function createLog(input: CreateLogInput): Promise<HabitLog> {
  void input;
  throw new Error('TODO: implement createLog write.');
}

export async function completeHabitToday(habitId: EntityId, note?: string): Promise<HabitLog> {
  void habitId;
  void note;
  throw new Error('TODO: implement completeHabitToday helper.');
}

export async function updateLog(logId: EntityId, input: UpdateLogInput): Promise<HabitLog> {
  void logId;
  void input;
  throw new Error('TODO: implement updateLog write.');
}

export async function deleteLog(logId: EntityId): Promise<void> {
  void logId;
  throw new Error('TODO: implement deleteLog write.');
}
