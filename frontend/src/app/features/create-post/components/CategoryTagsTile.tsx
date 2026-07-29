'use client';

import React, { useState } from 'react';
import {
  Layers,
  Tag as TagIcon,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import type { Category, Tag } from '../types';

interface CategoryTagsTileProps {
  categories: Category[];
  availableTags: Tag[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  selectedTags: string[];
  onAddTag: (tagName: string) => void;
  onRemoveTag: (tagName: string) => void;
  // Read-only: the cover image is the first image inserted into the story, so
  // there is no cover input. This drives a small status badge only.
  detectedArticleImages?: string[];
}

export function CategoryTagsTile({
  categories,
  availableTags,
  selectedCategoryId,
  onSelectCategory,
  selectedTags,
  onAddTag,
  onRemoveTag,
  detectedArticleImages = [],
}: CategoryTagsTileProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tagInput, setTagInput] = useState('');

  const selectedCatName = categories.find((c) => c.id === selectedCategoryId)?.name;
  const hasCover = detectedArticleImages.length > 0;

  const handleAdd = (name: string) => {
    const trimmed = name.trim().replace(/^#/, '');
    if (trimmed) {
      onAddTag(trimmed);
      setTagInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd(tagInput);
    }
  };

  return (
    <div className="mb-8 rounded-2xl bg-card border border-border overflow-hidden transition-all shadow-sm">
      {/* Collapsible Tile Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-muted text-left cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-foreground">
            <Layers size={14} className="text-terracotta-primary" />
            <span>Playstyle Formation</span>
          </div>

          {selectedCatName ? (
            <span className="bg-terracotta-primary/10 border border-terracotta-primary/30 text-terracotta-primary text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span>Category:</span> <strong className="text-foreground">{selectedCatName}</strong>
            </span>
          ) : (
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Category Required *
            </span>
          )}

          {selectedTags.length > 0 && (
            <span className="bg-muted border border-border text-foreground text-xs px-2.5 py-0.5 rounded-full font-medium">
              {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'}
            </span>
          )}

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${hasCover
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted border border-border text-muted-foreground'
              }`}
          >
            <ImageIcon size={11} /> {hasCover ? 'Cover: first image' : 'Cover: default'}
          </span>
        </div>

        <div className="text-muted-foreground hover:text-foreground transition-colors">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expandable Settings Panel */}
      {isExpanded && (
        <div className="p-5 border-t border-border space-y-6 animate-in fade-in duration-150">
          {/* 1. Category Section (Single Select) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2.5 flex items-center gap-1.5">
              <Layers size={14} className="text-terracotta-primary" /> Category <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer font-medium ${isSelected
                        ? 'bg-terracotta-primary text-white font-bold shadow-md'
                        : 'bg-card hover:bg-muted text-foreground border border-border'
                      }`}
                  >
                    {isSelected && <Check size={12} />}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tags Section */}
          <div className="pt-2 border-t border-border">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
              <TagIcon size={14} className="text-terracotta-primary" /> Tags (Topics)
            </label>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a tag & press Enter (e.g. Football, IPL, Tactics)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-card text-foreground placeholder:text-muted-foreground/60 border border-border rounded-xl px-3.5 py-2 text-xs focus:border-terracotta-primary focus:outline-none transition-all w-full sm:w-80"
              />
              {tagInput.trim() && (
                <button
                  type="button"
                  onClick={() => handleAdd(tagInput)}
                  className="px-3 py-2 rounded-xl bg-terracotta-primary hover:bg-terracotta-dark text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              )}
            </div>

            {/* Selected Tags Pills */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-terracotta-primary/10 border border-terracotta-primary/30 text-terracotta-primary text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(tag)}
                      className="hover:text-foreground cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-muted-foreground flex items-center mr-1">Suggestions:</span>
                {availableTags
                  .filter((t) => !selectedTags.includes(t.name))
                  .slice(0, 6)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleAdd(t.name)}
                      className="text-[11px] bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      + {t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
