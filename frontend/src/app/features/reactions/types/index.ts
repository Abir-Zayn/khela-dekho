export type ReactionType = 'like' | 'love' | 'laugh';
export type ReactionFilter = 'all' | ReactionType;

export interface ReactionCounts {
  like: number;
  love: number;
  laugh: number;
}

// Mirrors backend/app/schemas.py::ReactorUser (docs/tickets/FEAT-POST-REACTIONS-002.md).
export interface ReactorUser {
  id: string;
  username: string;
  full_name: string | null;
  profile_photo_url: string | null;
}

// Mirrors backend/app/schemas.py::ReactionEntry.
export interface ReactionEntry {
  user: ReactorUser;
  reaction_type: ReactionType;
  reacted_at: string;
}

// Mirrors backend/app/schemas.py::ReactionListResponse, the shape
// GET /api/posts/{post_id}/reactions will return once shipped.
export interface ReactionListResponse {
  total: number;
  reactions: ReactionEntry[];
}
