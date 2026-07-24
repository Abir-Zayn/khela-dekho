'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';

// Promotes a draft to a published post. The backend enforces the strict publish
// rules (title/content length, category required) and returns the full post.
export async function publishDraftAction(draftId: string) {
  const post = await apiFetch(`/api/posts/${draftId}/publish`, { method: 'POST' });
  revalidatePath('/');
  return post;
}
