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

export interface CreatePostInput {
  title: string;
  content: string;
  category_id: string;
  image_url?: string | null;
  video_url?: string | null;
  reference_url?: string | null;
  tags?: string[];
}

// Light ack returned by the autosave endpoint.
export interface DraftAck {
  id: string;
  status: 'draft' | 'published';
  updated_at: string;
}

// Autosave payload — every field optional; server updates only what's sent.
export interface DraftSaveInput {
  title?: string | null;
  content?: string | null;
  category_id?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  video_url?: string | null;
  reference_url?: string | null;
  client_updated_at?: string | null;
}

// Shape persisted to the browser (Layer 1, offline-proof local autosave).
export interface LocalDraftSnapshot {
  draftId: string | null;
  title: string;
  contentHtml: string;
  selectedCategoryId: string;
  selectedTags: string[];
  savedAt: string;
  serverUpdatedAt: string | null;
}
