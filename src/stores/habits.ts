import { defineStore } from 'pinia';
import {
  createHabit,
  deleteHabit,
  getHabitById,
  listHabitsForCurrentUser,
  updateHabit,
  type CreateHabitInput,
  type UpdateHabitInput,
} from '@/services/habits';
import type { Habit } from '@/types/models';

interface HabitsState {
  items: Habit[];
  selected: Habit | null;
  loading: boolean;
  error: string | null;
}

export const useHabitsStore = defineStore('habits', {
  state: (): HabitsState => ({
    items: [],
    selected: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchMine(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.items = await listHabitsForCurrentUser();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch habits.';
      } finally {
        this.loading = false;
      }
    },
    async fetchById(habitId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.selected = await getHabitById(habitId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch habit details.';
      } finally {
        this.loading = false;
      }
    },
    async create(input: CreateHabitInput): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const created = await createHabit(input);
        this.items = [created, ...this.items];
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create habit.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async update(habitId: string, input: UpdateHabitInput): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const updated = await updateHabit(habitId, input);
        this.items = this.items.map((habit) => (habit.id === habitId ? updated : habit));
        if (this.selected?.id === habitId) {
          this.selected = updated;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update habit.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async remove(habitId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await deleteHabit(habitId);
        this.items = this.items.filter((habit) => habit.id !== habitId);
        if (this.selected?.id === habitId) {
          this.selected = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete habit.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
