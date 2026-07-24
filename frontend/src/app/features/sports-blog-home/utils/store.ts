import { create } from 'zustand';
import { SportsBlogHomeState } from '../types';

export const useSportsBlogStore = create<SportsBlogHomeState>((set) => ({
  searchQuery: '',
  selectedAuthor: '',
  selectedCategory: '',
  layoutMode: 'grid',
  selectedPostId: null as string | null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedAuthor: (author) => set({ selectedAuthor: author }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setSelectedPostId: (id) => set({ selectedPostId: id }),
  resetFilters: () => set({ searchQuery: '', selectedAuthor: '', selectedCategory: '' }),
}));
