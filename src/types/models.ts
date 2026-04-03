export type EntityId = string;
export type Uid = string;
export type TimestampMs = number;

export interface UserProfile {
  id: Uid;
  display_name: string;
  photo_url: string;
  created_at: TimestampMs;
}

export interface HabitTemplate {
  id: EntityId;
  title: string;
  description: string;
  tags: string[];
  created_by: string;
  created_at: TimestampMs;
}

export interface Habit {
  id: EntityId;
  owner_id: Uid;
  title: string;
  description: string;
  tags: string[];
  from_template_id: EntityId | null;
  archived: boolean;
  created_at: TimestampMs;
}

export type HabitLogStatus = 'completed';

export interface HabitLog {
  id: EntityId;
  owner_id: Uid;
  habit_id: EntityId;
  date: string;
  status: HabitLogStatus;
  note: string;
  created_at: TimestampMs;
}

export interface AuthUser {
  uid: Uid;
  email: string | null;
}

export interface PaginationCursor {
  value: string;
}

export interface PageResult<T> {
  items: T[];
  nextCursor: PaginationCursor | null;
}

export interface AppError {
  message: string;
  code?: string;
}
