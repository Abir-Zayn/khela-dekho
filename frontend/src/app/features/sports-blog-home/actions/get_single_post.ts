'use server';

import { apiFetch } from './http';
import type { Post } from '../types';

export async function getSinglePost(postId: string): Promise<Post> {
  return apiFetch<Post>(`/api/posts/${postId}`);
}
