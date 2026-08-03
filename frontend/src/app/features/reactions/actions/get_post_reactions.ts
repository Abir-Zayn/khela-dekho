'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { ReactionFilter, ReactionListResponse } from '../types';

// GET /api/posts/{post_id}/reactions is live (backend/app/routers/posts.py::list_post_reactions).
// Public endpoint, no auth header required.
export interface GetPostReactionsParams {
  type?: ReactionFilter;
  limit?: number;
  offset?: number;
}

export async function getPostReactions(
  postId: string,
  { type = 'all', limit = 20, offset = 0 }: GetPostReactionsParams = {}
): Promise<ReactionListResponse> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (type !== 'all') params.set('type', type);

  return apiFetch<ReactionListResponse>(
    `/api/posts/${postId}/reactions?${params.toString()}`
  );
}
