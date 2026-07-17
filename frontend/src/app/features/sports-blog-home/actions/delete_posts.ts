'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';

export async function deletePost(postId: string): Promise<void> {
  await apiFetch<void>(`/api/posts/${postId}`, { method: 'DELETE' });
  revalidatePath('/');
}
