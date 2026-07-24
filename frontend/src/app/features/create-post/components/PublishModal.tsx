'use client';

import React, { useEffect, useState } from 'react';
import { X, Image as ImageIcon, Tag as TagIcon, Layers, Video, Link as LinkIcon, Loader2, Sparkles } from 'lucide-react';
import type { Category, Tag } from '../types';
import { listCategories } from '../actions/list_categories';
import { listTags } from '../actions/list_tags';
import { PreviewComponent } from './preview-component';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (data: {
    category_id: string;
    tags: string[];
    image_url: string | null;
    video_url: string | null;
    reference_url: string | null;
  }) => void;
  title: string;
  content: string;
  isPublishing: boolean;
  initialCategoryId?: string;
  initialTags?: string[];
}

export function PublishModal({
  isOpen,
  onClose,
  onPublish,
  title,
  content,
  isPublishing,
  initialCategoryId,
  initialTags,
}: PublishModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId || '');
  const [tagInput, setTagInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [referenceUrl, setReferenceUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialCategoryId) setSelectedCategoryId(initialCategoryId);
      if (initialTags && initialTags.length > 0) setSelectedTags(initialTags);
      listCategories().then((cats) => {
        setCategories(cats);
      });
      listTags().then((tags) => {
        setAvailableTags(tags);
      });
    }
  }, [isOpen, initialCategoryId, initialTags]);

  if (!isOpen) return null;

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim().replace(/^#/, '');
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setTagInput('');
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setError('Please select a category for your post.');
      return;
    }
    setError(null);
    onPublish({
      category_id: selectedCategoryId,
      tags: selectedTags,
      image_url: imageUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      reference_url: referenceUrl.trim() || null,
    });
  };

  const cleanExcerpt = content
    ? content.replace(/<[^>]*>?/gm, '').slice(0, 160)
    : 'No story content preview available...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Story Preview */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase flex items-center gap-1.5 mb-2">
                <Sparkles size={14} /> Story Preview
              </span>
              <h2 className="text-2xl font-bold text-white leading-snug break-words">
                {title || 'Untitled Story'}
              </h2>
              <p className="text-sm text-zinc-400 mt-2 line-clamp-3 italic leading-relaxed">
                &ldquo;{cleanExcerpt}...&rdquo;
              </p>
            </div>

            {/* Cover Image Preview */}
            <PreviewComponent type="image" url={imageUrl.trim()} />
          </div>

          {/* Right Column: Publishing Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Publishing Details</h3>
              <p className="text-xs text-zinc-400">Categorize your article to reach the right sports fans.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Category Select & Segmentation Chips */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <Layers size={14} className="text-amber-500" /> Category *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  if (e.target.value) setError(null);
                }}
                className={`w-full bg-zinc-900 border ${
                  !selectedCategoryId && error ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                } text-white rounded-xl py-3 px-4 text-sm focus:border-red-500 focus:outline-none transition-all cursor-pointer mb-2.5`}
                required
              >
                <option value="">-- Select a Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Interactive Category Chips */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border border-zinc-800/80 rounded-xl bg-zinc-950/50">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setError(null);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/50 border border-red-500'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {isSelected && <span>✓</span>}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <TagIcon size={14} className="text-amber-500" /> Tags (Topics)
              </label>
              <input
                type="text"
                placeholder="Type tag & press Enter (e.g. Football, IPL, Tactics)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 text-sm focus:border-red-500 focus:outline-none transition-all"
              />

              {/* Tag Suggestions */}
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {availableTags
                    .filter((t) => !selectedTags.includes(t.name))
                    .slice(0, 6)
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleAddTag(t.name)}
                        className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        + {t.name}
                      </button>
                    ))}
                </div>
              )}

              {/* Selected Tags Pills */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-amber-500" /> Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 text-sm focus:border-red-500 focus:outline-none transition-all"
              />
            </div>

            {/* Optional Links: Video & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Video size={14} className="text-amber-500" /> Video URL
                </label>
                <input
                  type="url"
                  placeholder="YouTube / Video link"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:border-red-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                  <LinkIcon size={14} className="text-amber-500" /> Reference URL
                </label>
                <input
                  type="url"
                  placeholder="External source link"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:border-red-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isPublishing}
                className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-red-950/50 flex items-center gap-2 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Publishing...
                  </>
                ) : (
                  'Publish Now'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
