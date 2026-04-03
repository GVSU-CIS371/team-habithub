import { defineStore } from 'pinia';
import { getTemplateById, listTemplates } from '@/services/templates';
import type { HabitTemplate, PaginationCursor } from '@/types/models';

interface TemplatesState {
  items: HabitTemplate[];
  selected: HabitTemplate | null;
  loading: boolean;
  error: string | null;
  nextCursor: PaginationCursor | null;
}

export const useTemplatesStore = defineStore('templates', {
  state: (): TemplatesState => ({
    items: [],
    selected: null,
    loading: false,
    error: null,
    nextCursor: null,
  }),
  actions: {
    async fetchFirstPage(pageSize = 10): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const page = await listTemplates({ pageSize, cursor: null });
        this.items = page.items;
        this.nextCursor = page.nextCursor;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch templates.';
      } finally {
        this.loading = false;
      }
    },
    async fetchNextPage(pageSize = 10): Promise<void> {
      if (!this.nextCursor) {
        return;
      }

      this.loading = true;
      this.error = null;
      try {
        const page = await listTemplates({ pageSize, cursor: this.nextCursor });
        this.items = [...this.items, ...page.items];
        this.nextCursor = page.nextCursor;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch next template page.';
      } finally {
        this.loading = false;
      }
    },
    async fetchById(templateId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.selected = await getTemplateById(templateId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch template details.';
      } finally {
        this.loading = false;
      }
    },
  },
});
