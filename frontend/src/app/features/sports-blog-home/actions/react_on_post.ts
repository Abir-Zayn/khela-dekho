'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './http';
import type { Post } from '../types';

export type ReactionType = 'like' | 'love' | 'laugh';

export async function reactToPost(postId: string, reactionType: ReactionType): Promise<Post> {
  const post = await apiFetch<Post>(`/api/posts/${postId}/react`, {
    method: 'POST',
    body: JSON.stringify({ reaction_type: reactionType }),
  });
  revalidatePath('/');
  return post;
}

export async function removeReaction(postId: string): Promise<Post> {
  const post = await apiFetch<Post>(`/api/posts/${postId}/react`, { method: 'DELETE' });
  revalidatePath('/');
  return post;
}
