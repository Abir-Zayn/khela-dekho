'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';
import type { Post } from '../types';

export async function pinPost(postId: string): Promise<Post> {
  const post = await apiFetch<Post>(`/api/posts/${postId}/pin`, {
    method: 'POST',
  });
  revalidatePath('/');
  return post;
}

export async function unpinPost(postId: string): Promise<Post> {
  const post = await apiFetch<Post>(`/api/posts/${postId}/pin`, {
    method: 'DELETE',
  });
  revalidatePath('/');
  return post;
}

export async function getPinnedPosts(author?: string): Promise<Post[]> {
  const query = author ? `?author=${encodeURIComponent(author)}` : '';
  return await apiFetch<Post[]>(`/api/posts/pinned${query}`);
}
