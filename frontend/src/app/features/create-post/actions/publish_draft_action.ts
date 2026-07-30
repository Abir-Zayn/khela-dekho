'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';

export async function publishDraftAction(
  draftId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const post = await apiFetch(`/api/posts/${draftId}/publish`, { method: 'POST' });
    revalidatePath('/');
    return { success: true, data: post };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to publish draft.',
    };
  }
}
