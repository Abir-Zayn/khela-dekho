'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';
import type { Post } from '../types';

export interface CreatePostInput {
  title: string;
  content: string;
  category_id: string;
  image_url?: string | null;
  video_url?: string | null;
  reference_url?: string | null;
  tags?: string[];
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const post = await apiFetch<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  revalidatePath('/');
  return post;
}
