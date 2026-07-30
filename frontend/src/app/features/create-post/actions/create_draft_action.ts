'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { DraftAck } from '../types';

export async function createDraftAction(): Promise<{ success: boolean; data?: DraftAck; error?: string }> {
  try {
    const data = await apiFetch<DraftAck>('/api/posts/drafts', { method: 'POST' });
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create draft.',
    };
  }
}
