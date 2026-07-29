import { API_BASE_URL } from '../../../configs/queryClient';
import type { Post } from '../types';

export interface ListPostsParams {
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

// Public feed read: called directly from the browser (no Next.js server action
// hop) since this endpoint needs no auth and the backend now sets its own
// CORS + Cache-Control headers. Keep `apiFetch`/server actions for mutations
// and authenticated reads, where the httpOnly cookie must stay server-side.
export async function listAllPosts(params?: ListPostsParams): Promise<Post[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.tag) search.set('tag', params.tag);
  if (params?.limit != null) search.set('limit', String(params.limit));
  if (params?.offset != null) search.set('offset', String(params.offset));
  const qs = search.toString();

  const res = await fetch(`${API_BASE_URL}/api/posts${qs ? `?${qs}` : ''}`);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}
