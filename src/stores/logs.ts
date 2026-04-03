import { defineStore } from 'pinia';
import {
  completeHabitToday,
  createLog,
  deleteLog,
  listLogsByHabit,
  updateLog,
  type CreateLogInput,
  type UpdateLogInput,
} from '@/services/logs';
import type { HabitLog } from '@/types/models';

interface LogsState {
  items: HabitLog[];
  loading: boolean;
  error: string | null;
}

export const useLogsStore = defineStore('logs', {
  state: (): LogsState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchByHabit(habitId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.items = await listLogsByHabit(habitId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch logs.';
      } finally {
        this.loading = false;
      }
    },
    async create(input: CreateLogInput): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const created = await createLog(input);
        this.items = [created, ...this.items];
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create log.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async markCompletedToday(habitId: string, note?: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const created = await completeHabitToday(habitId, note);
        this.items = [created, ...this.items];
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to mark completion.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async update(logId: string, input: UpdateLogInput): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const updated = await updateLog(logId, input);
        this.items = this.items.map((log) => (log.id === logId ? updated : log));
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update log.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async remove(logId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await deleteLog(logId);
        this.items = this.items.filter((log) => log.id !== logId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete log.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
