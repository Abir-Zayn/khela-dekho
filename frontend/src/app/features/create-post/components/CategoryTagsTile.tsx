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
  Video,
  Link as LinkIcon,
  Check,
  Sparkles,
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
  coverImageUrl: string;
  onChangeCoverImageUrl: (url: string) => void;
  detectedArticleImages?: string[];
  videoUrl: string;
  onChangeVideoUrl: (url: string) => void;
  referenceUrl: string;
  onChangeReferenceUrl: (url: string) => void;
}

export function CategoryTagsTile({
  categories,
  availableTags,
  selectedCategoryId,
  onSelectCategory,
  selectedTags,
  onAddTag,
  onRemoveTag,
  coverImageUrl,
  onChangeCoverImageUrl,
  detectedArticleImages = [],
  videoUrl,
  onChangeVideoUrl,
  referenceUrl,
  onChangeReferenceUrl,
}: CategoryTagsTileProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [coverSourceMode, setCoverSourceMode] = useState<'detected' | 'custom'>(
    detectedArticleImages.length > 0 ? 'detected' : 'custom'
  );

  const selectedCatName = categories.find((c) => c.id === selectedCategoryId)?.name;

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
    <div className="mb-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden transition-all shadow-xl">
      {/* Collapsible Tile Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-900 text-left cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-zinc-300">
            <Layers size={14} className="text-amber-500" />
            <span>Story Settings & Metadata</span>
          </div>

          {selectedCatName ? (
            <span className="bg-red-950/80 border border-red-800/80 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span>Category:</span> <strong className="text-white">{selectedCatName}</strong>
            </span>
          ) : (
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Category Required *
            </span>
          )}

          {selectedTags.length > 0 && (
            <span className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'}
            </span>
          )}

          {coverImageUrl && (
            <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <ImageIcon size={11} /> Cover Image Set
            </span>
          )}
        </div>

        <div className="text-zinc-400 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expandable Settings Panel */}
      {isExpanded && (
        <div className="p-5 border-t border-zinc-800/60 space-y-6 animate-in fade-in duration-150">
          {/* 1. Category Section (Single Select) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2.5 flex items-center gap-1.5">
              <Layers size={14} className="text-amber-500" /> Category <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/60 ring-2 ring-red-500/50'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Cover Image Section (Article Detection or Custom URL) */}
          <div className="pt-2 border-t border-zinc-800/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-amber-500" /> Cover Image
              </label>

              {detectedArticleImages.length > 0 && (
                <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCoverSourceMode('detected')}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                      coverSourceMode === 'detected'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Article Images ({detectedArticleImages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverSourceMode('custom')}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                      coverSourceMode === 'custom'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Custom URL
                  </button>
                </div>
              )}
            </div>

            {/* Option A: Select from Article Images */}
            {detectedArticleImages.length > 0 && coverSourceMode === 'detected' && (
              <div className="space-y-2 mb-3">
                <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" /> Select an image inserted in your story as the Cover Image:
                </p>
                <div className="flex flex-wrap gap-3 overflow-x-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                  {detectedArticleImages.map((imgUrl, idx) => {
                    const isSelected = coverImageUrl === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onChangeCoverImageUrl(imgUrl)}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-red-500 ring-2 ring-red-500/50 scale-105'
                            : 'border-zinc-800 hover:border-zinc-600 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Article Image ${idx + 1}`}
                          className="w-24 h-16 object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-red-600/30 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-red-600 text-white rounded-full p-1 shadow-md">
                              <Check size={12} />
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Option B: Custom Image URL Input */}
            {(detectedArticleImages.length === 0 || coverSourceMode === 'custom') && (
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (Cover image URL)"
                  value={coverImageUrl}
                  onChange={(e) => onChangeCoverImageUrl(e.target.value)}
                  className="w-full bg-zinc-950 text-white placeholder:text-zinc-600 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:border-red-500 focus:outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* 3. Tags Section */}
          <div className="pt-2 border-t border-zinc-800/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
              <TagIcon size={14} className="text-amber-500" /> Tags (Topics)
            </label>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a tag & press Enter (e.g. Football, IPL, Tactics)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-zinc-950 text-white placeholder:text-zinc-600 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:border-red-500 focus:outline-none transition-all w-full sm:w-80"
              />
              {tagInput.trim() && (
                <button
                  type="button"
                  onClick={() => handleAdd(tagInput)}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                    className="bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(tag)}
                      className="hover:text-white cursor-pointer"
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
                <span className="text-[11px] text-zinc-500 flex items-center mr-1">Suggestions:</span>
                {availableTags
                  .filter((t) => !selectedTags.includes(t.name))
                  .slice(0, 6)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleAdd(t.name)}
                      className="text-[11px] bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      + {t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* 4. Optional Media & References Links */}
          <div className="pt-2 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Video size={14} className="text-amber-500" /> Video Stream Link (Optional)
              </label>
              <input
                type="url"
                placeholder="YouTube / Vimeo video link"
                value={videoUrl}
                onChange={(e) => onChangeVideoUrl(e.target.value)}
                className="w-full bg-zinc-950 text-white placeholder:text-zinc-600 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <LinkIcon size={14} className="text-amber-500" /> Reference URL (Optional)
              </label>
              <input
                type="url"
                placeholder="External source article link"
                value={referenceUrl}
                onChange={(e) => onChangeReferenceUrl(e.target.value)}
                className="w-full bg-zinc-950 text-white placeholder:text-zinc-600 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
