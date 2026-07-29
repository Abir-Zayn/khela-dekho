import { API_BASE_URL } from '../../../configs/queryClient';
import type { Post } from '../types';

export async function listRelatedPosts(postId: string, limit = 4): Promise<Post[]> {
  try {
    const search = new URLSearchParams();
    search.set('limit', String(limit));

    const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/related?${search.toString()}`);
    if (!res.ok) {
      return [];
    }
    return await res.json();
  } catch {
    return [];
  }
}
