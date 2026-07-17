'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './http';

export async function deletePost(postId: string): Promise<void> {
  await apiFetch<void>(`/api/posts/${postId}`, { method: 'DELETE' });
  revalidatePath('/');
}
