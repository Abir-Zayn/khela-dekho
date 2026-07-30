'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../../configs/apiClient';
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

export async function updatePost(
  postId: string,
  input: UpdatePostInput
): Promise<{ success: boolean; data?: Post; error?: string }> {
  try {
    const post = await apiFetch<Post>(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    revalidatePath('/');
    return { success: true, data: post };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update post.',
    };
  }
}
