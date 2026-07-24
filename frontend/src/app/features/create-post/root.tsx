'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Flame, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser } from '../auth';
import { LexicalEditor } from './components/LexicalEditor';
import { PublishModal } from './components/PublishModal';
import { CategoryTagsTile } from './components/CategoryTagsTile';
import { createPostAction } from './actions/create_post_action';
import { listCategories } from './actions/list_categories';
import { listTags } from './actions/list_tags';
import type { Category, Tag } from './types';

export default function CreatePostRoot() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });

  useEffect(() => {
    listCategories().then(setCategories);
    listTags().then(setAvailableTags);
  }, []);

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim().replace(/^#/, '');
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleOpenPublishModal = () => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'You must log in to publish your post.',
      });
      router.push('/login?redirect=/create-post');
      return;
    }
    if (!title.trim()) {
      setFormError('Please enter a story title before publishing.');
      return;
    }
    if (!selectedCategoryId) {
      setFormError('Please select a category for your story before publishing.');
      return;
    }
    if (!contentHtml.trim() || contentHtml === '<p></p>') {
      setFormError('Please write your story content before publishing.');
      return;
    }
    setFormError(null);
    setIsPublishModalOpen(true);
  };

  const handlePublish = async (publishData: {
    category_id: string;
    tags: string[];
    image_url: string | null;
    video_url: string | null;
    reference_url: string | null;
  }) => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'You must log in to publish your post.',
      });
      router.push('/login?redirect=/create-post');
      return;
    }
    try {
      setIsPublishing(true);
      setFormError(null);
      await createPostAction({
        title: title.trim(),
        content: contentHtml,
        category_id: publishData.category_id,
        tags: publishData.tags,
        image_url: publishData.image_url,
        video_url: publishData.video_url,
        reference_url: publishData.reference_url,
      });
      setIsPublishing(false);
      setIsPublishModalOpen(false);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setIsPublishing(false);
      const message = err instanceof Error ? err.message : 'Failed to create post. Please try again.';
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-500 selection:text-white font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur border-b border-zinc-900 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Draft Info */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Back to feed"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <Flame size={18} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Draft in {user?.full_name || user?.username || 'Khela Dekho'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenPublishModal}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all shadow-md shadow-red-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={14} /> Publish...
            </button>

            {user && (
              <div className="flex items-center gap-2">
                {user.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_photo_url}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white uppercase">
                    {(user.full_name || user.username).charAt(0)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Medium Writing Canvas */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {formError && (
          <div className="mb-8 p-4 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-2xl animate-in fade-in">
            {formError}
          </div>
        )}

        {/* Story Title Input */}
        <div className="mb-6">
          <textarea
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            rows={1}
            className="w-full text-4xl sm:text-5xl font-black placeholder:text-zinc-700 bg-transparent text-white border-none outline-none tracking-tight resize-none overflow-hidden font-serif"
          />
        </div>

        {/* Collapsible Category & Tags Tile Component */}
        <CategoryTagsTile
          categories={categories}
          availableTags={availableTags}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(catId) => {
            setSelectedCategoryId(catId);
            setFormError(null);
          }}
          selectedTags={selectedTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />

        {/* Lexical Rich Text Editor */}
        <LexicalEditor
          onChange={setContentHtml}
          placeholder="Tell your story..."
        />
      </main>

      {/* Medium Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
        title={title}
        content={contentHtml}
        isPublishing={isPublishing}
        initialCategoryId={selectedCategoryId}
        initialTags={selectedTags}
      />
    </div>
  );
}
