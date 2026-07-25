const TAG_COLORS: Record<string, string> = {
  Tactical: 'bg-terracotta-primary/10 text-terracotta-primary border-terracotta-primary/20',
  Analysis: 'bg-sage-deep/10 text-sage-deep border-sage-deep/20',
  Opinion: 'bg-terracotta-light/10 text-terracotta-dark border-terracotta-light/20',
  Interview: 'bg-mint-bright/10 text-sage-deep border-mint-bright/20',
  'Behind the Scenes': 'bg-terracotta-primary/10 text-terracotta-dark border-terracotta-primary/20',
  Highlights: 'bg-terracotta-dark/10 text-terracotta-dark border-terracotta-dark/20',
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

export const getTagColor = (tag: string) => TAG_COLORS[tag] || 'bg-muted text-muted-foreground border-border';

export const getPostGradient = (id: string) => GRADIENTS[hashToIndex(id, GRADIENTS.length)];

export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
};

export const getExcerpt = (html: string, maxLength: number = 200): string => {
  const plainText = stripHtml(html);
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.substring(0, maxLength)}...`;
};

export const getReadTime = (content: string) => {
  const plainText = stripHtml(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

export const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
