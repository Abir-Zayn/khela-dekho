import { create } from 'zustand';
import { SportsBlogHomeState } from '../types';

export const useSportsBlogStore = create<SportsBlogHomeState>((set) => ({
  searchQuery: '',
  selectedAuthor: '',
  layoutMode: 'grid',
  selectedPostId: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedAuthor: (author) => set({ selectedAuthor: author }),
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setSelectedPostId: (id) => set({ selectedPostId: id }),
  resetFilters: () => set({ searchQuery: '', selectedAuthor: '' }),
}));
