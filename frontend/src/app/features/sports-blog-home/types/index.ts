export interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  date_posted: string;
}

export type LayoutMode = 'grid' | 'list';

export interface SportsBlogHomeState {
  searchQuery: string;
  selectedAuthor: string;
  layoutMode: LayoutMode;
  selectedPostId: number | null;
  setSearchQuery: (query: string) => void;
  setSelectedAuthor: (author: string) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSelectedPostId: (id: number | null) => void;
  resetFilters: () => void;
}
