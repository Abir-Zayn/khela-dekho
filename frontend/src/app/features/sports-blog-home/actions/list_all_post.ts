'use server';

import { apiFetch } from './http';
import type { Post } from '../types';

export interface ListPostsParams {
  q?: string;
  tag?: string;
}

export async function listAllPosts(params?: ListPostsParams): Promise<Post[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.tag) search.set('tag', params.tag);
  const qs = search.toString();

  return apiFetch<Post[]>(`/api/posts${qs ? `?${qs}` : ''}`);
}
