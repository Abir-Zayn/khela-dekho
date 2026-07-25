'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { Post } from '../types';

export interface ListPostsParams {
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export async function listAllPosts(params?: ListPostsParams): Promise<Post[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.tag) search.set('tag', params.tag);
  if (params?.limit != null) search.set('limit', String(params.limit));
  if (params?.offset != null) search.set('offset', String(params.offset));
  const qs = search.toString();

  return apiFetch<Post[]>(`/api/posts${qs ? `?${qs}` : ''}`);
}
