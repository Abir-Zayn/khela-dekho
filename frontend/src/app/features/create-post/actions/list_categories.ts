'use server';

import { apiFetch } from '../../../configs/apiClient';
import type { Category } from '../types';

export async function listCategories(): Promise<Category[]> {
  try {
    return await apiFetch<Category[]>('/api/categories');
  } catch {
    return [];
  }
}
