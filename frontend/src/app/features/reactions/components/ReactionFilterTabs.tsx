'use client';

import { Toggle } from '@/src/components/ui/toggle';
import type { ReactionCounts, ReactionFilter } from '../types';

const FILTERS: { key: ReactionFilter; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '\u{1F465}' },
  { key: 'like', label: 'Like', emoji: '❤️' },
  { key: 'love', label: 'Love', emoji: '\u{1F525}' },
  { key: 'laugh', label: 'Laugh', emoji: '\u{1F604}' },
];

function countFor(key: ReactionFilter, counts: ReactionCounts): number {
  if (key === 'all') return counts.like + counts.love + counts.laugh;
  return counts[key];
}

export interface ReactionFilterTabsProps {
  value: ReactionFilter;
  onChange: (value: ReactionFilter) => void;
  counts: ReactionCounts;
}

export function ReactionFilterTabs({ value, onChange, counts }: ReactionFilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
      {FILTERS.map((f) => (
        <Toggle
          key={f.key}
          pressed={value === f.key}
          onPressedChange={() => onChange(f.key)}
          variant="outline"
          size="sm"
        >
          <span>{f.emoji}</span>
          <span>{f.label}</span>
          <span className="opacity-60">{countFor(f.key, counts)}</span>
        </Toggle>
      ))}
    </div>
  );
}
