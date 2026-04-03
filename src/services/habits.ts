import type { EntityId, Habit } from '@/types/models';

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

export async function listHabitsForCurrentUser(): Promise<Habit[]> {
  throw new Error('TODO: implement listHabitsForCurrentUser query for habits.');
}

export async function getHabitById(habitId: EntityId): Promise<Habit | null> {
  void habitId;
  throw new Error('TODO: implement getHabitById fetch scoped to owner.');
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  void input;
  throw new Error('TODO: implement createHabit write.');
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
