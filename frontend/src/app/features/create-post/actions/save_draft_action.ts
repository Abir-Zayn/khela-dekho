'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { DraftAck, DraftSaveInput } from '../types';

export async function saveDraftAction(
  draftId: string,
  input: DraftSaveInput,
): Promise<{ success: boolean; data?: DraftAck; error?: string }> {
  try {
    const data = await apiFetch<DraftAck>(`/api/posts/${draftId}/draft`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save draft.',
    };
  }
}
