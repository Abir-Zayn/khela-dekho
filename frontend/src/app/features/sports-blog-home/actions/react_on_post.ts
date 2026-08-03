'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';
import type { Post } from '../types';

export type ReactionType = 'like' | 'love' | 'laugh';

export async function reactToPost(postId: string, reactionType: ReactionType): Promise<Post> {
  console.log('[reactToPost] postId:', postId, 'reactionType:', reactionType);
  try {
    const post = await apiFetch<Post>(`/api/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ reaction_type: reactionType }),
    });
    console.log('[reactToPost] success:', post);
    revalidatePath('/');
    return post;
  } catch (err) {
    console.error('[reactToPost] failed for postId:', postId, 'reactionType:', reactionType, 'error:', err);
    throw err;
  }
}

export async function removeReaction(postId: string): Promise<Post> {
  console.log('[removeReaction] postId:', postId);
  try {
    const post = await apiFetch<Post>(`/api/posts/${postId}/react`, { method: 'DELETE' });
    console.log('[removeReaction] success:', post);
    revalidatePath('/');
    return post;
  } catch (err) {
    console.error('[removeReaction] failed for postId:', postId, 'error:', err);
    throw err;
  }
}
