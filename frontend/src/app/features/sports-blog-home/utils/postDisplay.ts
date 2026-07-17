const TAG_COLORS: Record<string, string> = {
  Tactical: 'bg-red-500/10 text-red-500 border-red-500/20',
  Analysis: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Opinion: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Interview: 'bg-green-500/10 text-green-500 border-green-500/20',
  'Behind the Scenes': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Highlights: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

const GRADIENTS = [
  'from-red-600/20 via-zinc-900 to-zinc-950',
  'from-blue-600/20 via-zinc-900 to-zinc-950',
  'from-amber-600/20 via-zinc-900 to-zinc-950',
  'from-green-600/20 via-zinc-900 to-zinc-950',
  'from-purple-600/20 via-zinc-900 to-zinc-950',
  'from-pink-600/20 via-zinc-900 to-zinc-950',
];

// Deterministic index from a uuid string, used to pick a stable visual (gradient/color) per post
function hashToIndex(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export const getTagColor = (tag: string) => TAG_COLORS[tag] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

export const getPostGradient = (id: string) => GRADIENTS[hashToIndex(id, GRADIENTS.length)];

export const getReadTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

export const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
