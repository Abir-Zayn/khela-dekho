'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';
import type { CreatePostInput } from '../types';

export async function createPostAction(input: CreatePostInput) {
  const post = await apiFetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  revalidatePath('/');
  return post;
}
