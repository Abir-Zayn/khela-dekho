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
