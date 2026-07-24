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

// --- Football Interfaces ---
export interface FootballTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FootballMatch {
  id: number;
  competition: { id: number; name: string; code: string; emblem: string };
  utcDate: string;
  status: 'IN_PLAY' | 'PAUSED' | 'HALF_TIME' | 'FINISHED' | 'TIMED' | 'SCHEDULED';
  minute?: number;
  homeTeam: FootballTeam;
  awayTeam: FootballTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

// --- Cricket Interfaces ---
export interface CricketScore {
  r: number;
  w: number;
  o: number;
  inning: string;
}

export interface CricketTeamInfo {
  name: string;
  shortname: string;
  img?: string;
}

export interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  teams: string[];
  teamInfo?: CricketTeamInfo[];
  score?: CricketScore[];
  isLive: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

// --- Baseball Interfaces ---
export interface BaseballTeam {
  id: string;
  name: string;
  shortName: string;
  badge?: string;
}

export interface BaseballMatch {
  id: string;
  event: string;
  league: string;
  season: string;
  date: string;
  time: string;
  status: string;
  homeTeam: BaseballTeam;
  awayTeam: BaseballTeam;
  homeScore: number | null;
  awayScore: number | null;
  venue?: string;
  isLive: boolean;
}
