'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { DraftAck } from '../types';

// Creates an empty server-side draft and returns its id. Called once, lazily, on
// the first meaningful edit of a brand-new post.
export async function createDraftAction(): Promise<DraftAck> {
  return apiFetch<DraftAck>('/api/posts/drafts', { method: 'POST' });
}
