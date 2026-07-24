'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { Tag } from '../types';

export async function listTags(search?: string): Promise<Tag[]> {
  try {
    const query = search ? `?q=${encodeURIComponent(search)}` : '';
    return await apiFetch<Tag[]>(`/api/tags${query}`);
  } catch {
    return [];
  }
}
