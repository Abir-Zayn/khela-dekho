'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './http';
import type { Post } from '../types';

export interface UpdatePostInput {
  title?: string;
  content?: string;
  image_url?: string | null;
  video_url?: string | null;
  reference_url?: string | null;
  category_id?: string;
  tags?: string[];
}

export async function updatePost(postId: string, input: UpdatePostInput): Promise<Post> {
  const post = await apiFetch<Post>(`/api/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  revalidatePath('/');
  return post;
}
