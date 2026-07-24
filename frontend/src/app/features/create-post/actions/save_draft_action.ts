'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { DraftAck, DraftSaveInput } from '../types';

// Autosaves the current editor state into an existing server draft. Returns the
// light ack ({ id, status, updated_at }). Throws on 409 when the draft was edited
// elsewhere — the caller surfaces that as a conflict warning.
export async function saveDraftAction(
  draftId: string,
  input: DraftSaveInput,
): Promise<DraftAck> {
  return apiFetch<DraftAck>(`/api/posts/${draftId}/draft`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
