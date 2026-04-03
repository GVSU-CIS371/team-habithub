import type { EntityId, HabitTemplate, PageResult, PaginationCursor } from '@/types/models';

export interface ListTemplatesInput {
  pageSize: number;
  cursor: PaginationCursor | null;
}

export async function listTemplates(input: ListTemplatesInput): Promise<PageResult<HabitTemplate>> {
  void input;
  throw new Error('TODO: implement listTemplates query for habit_templates.');
}

export async function getTemplateById(templateId: EntityId): Promise<HabitTemplate | null> {
  void templateId;
  throw new Error('TODO: implement getTemplateById fetch.');
}
