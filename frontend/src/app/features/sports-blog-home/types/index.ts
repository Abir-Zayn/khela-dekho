export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ReactionCounts {
  laugh: number;
  love: number;
  like: number;
}

export interface Post {
  id: string;
  user_id: string;
  category_id: string;
  author: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  reference_url: string | null;
  date_posted: string;
  likes: number;
  category: Category;
  tags: Tag[];
  reaction_counts: ReactionCounts;
  current_user_reaction: string | null;
}

export type LayoutMode = 'grid' | 'list';

export interface SportsBlogHomeState {
  searchQuery: string;
  selectedAuthor: string;
  selectedCategory: string;
  layoutMode: LayoutMode;
  selectedPostId: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedAuthor: (author: string) => void;
  setSelectedCategory: (category: string) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSelectedPostId: (id: string | null) => void;
  resetFilters: () => void;
}
