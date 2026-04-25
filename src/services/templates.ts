import type { EntityId, HabitTemplate, PageResult, PaginationCursor } from '@/types/models';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { firestoreDb } from '@/services/firebase';

export interface ListTemplatesInput {
  pageSize: number;
  cursor: PaginationCursor | null;
}

function mapTemplateDoc(templateId: string, data: Record<string, unknown>): HabitTemplate {
  return {
    id: templateId,
    title: data.title as string,
    description: data.description as string,
    tags: (data.tags as string[]) ?? [],
    created_by: (data.created_by as string) ?? 'system',
    created_at: data.created_at as number,
  };
}

export async function listTemplates(input: ListTemplatesInput): Promise<PageResult<HabitTemplate>> {
  const pageSize = input.pageSize > 0 ? input.pageSize : 8;
  const templatesRef = collection(firestoreDb, 'habit_templates');

  const templatesQuery = input.cursor
    ? query(
        templatesRef,
        orderBy('title'),
        startAfter(input.cursor.value),
        limit(pageSize),
      )
    : query(templatesRef, orderBy('title'), limit(pageSize));

  const snapshot = await getDocs(templatesQuery);

  const items = snapshot.docs.map((templateDoc) => {
    return mapTemplateDoc(templateDoc.id, templateDoc.data() as Record<string, unknown>);
  });

  const lastItem = items[items.length - 1];

  return {
    items,
    nextCursor: lastItem ? { value: lastItem.title } : null,
  };
}

export async function getTemplateById(templateId: EntityId): Promise<HabitTemplate | null> {
  const templateRef = doc(firestoreDb, 'habit_templates', templateId);
  const snapshot = await getDoc(templateRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapTemplateDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}
