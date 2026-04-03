import { describe, expect, it } from 'vitest';
import { listHabitsForCurrentUser } from '@/services/habits';

describe('habits service scaffold', () => {
  it('throws until firestore integration is implemented', async () => {
    await expect(listHabitsForCurrentUser()).rejects.toThrow(
      'TODO: implement listHabitsForCurrentUser query for habits.',
    );
  });
});
