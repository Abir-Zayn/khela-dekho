'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser } from '../../auth';
import { getSinglePost } from '../../sports-blog-home/actions/get_single_post';
import { updatePost } from '../../sports-blog-home/actions/update_posts';
import { LexicalEditor } from './LexicalEditor';
import { CategoryTagsTile } from './CategoryTagsTile';
import { BrandLogo } from '../../../components/BrandLogo';
import { listCategories } from '../actions/list_categories';
import { listTags } from '../actions/list_tags';
import type { Category, Tag } from '../types';
import type { Post } from '../../sports-blog-home/types';
import { Textarea } from '@/src/components/ui/textarea';

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80';

function isEmptyContent(html: string): boolean {
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  return stripped.length === 0;
}

interface EditPostRootProps {
  postId: string;
}

export default function EditPostRoot({ postId }: EditPostRootProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [initialHtml, setInitialHtml] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });

  const {
    data: postData,
    isLoading: isLoadingPost,
    isError: isPostError,
    error: postError,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getSinglePost(postId),
    enabled: Boolean(postId),
  });

  useEffect(() => {
    listCategories().then(setCategories);
    listTags().then(setAvailableTags);
  }, []);

  // Populate state once post data is loaded
  useEffect(() => {
    if (postData && !isLoaded) {
      setOriginalPost(postData);
      setTitle(postData.title || '');
      setContentHtml(postData.content || '');
      setInitialHtml(postData.content || '');
      setSelectedCategoryId(postData.category?.id || '');
      setSelectedTags(postData.tags ? postData.tags.map((t) => t.name) : []);
      setIsLoaded(true);
    }
  }, [postData, isLoaded]);

  // Adjust textarea height when title is initialized or updated
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title, isLoaded]);

  // Extract all image URLs inserted into content HTML automatically
  const detectedArticleImages = useMemo(() => {
    if (!contentHtml) return [];
    const matches: string[] = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = regex.exec(contentHtml)) !== null) {
      if (match[1] && !matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  }, [contentHtml]);

  // Cover image: first image in content or original cover image or fallback
  const coverImage = detectedArticleImages[0] ?? originalPost?.image_url ?? DEFAULT_COVER_IMAGE;

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim().replace(/^#/, '');
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'You must log in to edit your post.',
      });
      router.push(`/login?redirect=/posts/${postId}/edit`);
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Title required', {
        description: 'Please enter a story title before saving.',
      });
      return;
    }
    if (trimmedTitle.length < 10) {
      toast.error('Title too short', {
        description: 'Your title needs at least 10 characters.',
      });
      return;
    }
    if (!selectedCategoryId) {
      toast.error('Category required', {
        description: 'Please select a category in Story Settings before saving.',
      });
      return;
    }
    if (!contentHtml.trim() || contentHtml === '<p></p>' || isEmptyContent(contentHtml)) {
      toast.error('Story is empty', {
        description: 'Please write your story content before saving changes.',
      });
      return;
    }

    const plainText = contentHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    if (plainText.length < 65) {
      toast.error('Content too short', {
        description: 'Your story content must be at least 65 characters long.',
      });
      return;
    }

    try {
      setIsSaving(true);

      const updateRes = await updatePost(postId, {
        title: trimmedTitle,
        content: contentHtml,
        category_id: selectedCategoryId,
        tags: selectedTags,
        image_url: coverImage,
      });

      if (!updateRes.success) {
        setIsSaving(false);
        toast.error('Could not save changes', { description: updateRes.error || 'Failed to update post.' });
        return;
      }

      setIsSaving(false);
      toast.success('Story updated successfully!');
      router.push(`/posts/${postId}`);
      router.refresh();
    } catch (err: unknown) {
      setIsSaving(false);
      const message = err instanceof Error ? err.message : 'Failed to update post. Please try again.';
      toast.error('Could not save changes', { description: message });
    }
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-terracotta-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading story for editing...</p>
        </div>
      </div>
    );
  }

  if (isPostError || !postData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Story Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {postError instanceof Error ? postError.message : 'The article you are trying to edit could not be loaded.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-terracotta-primary hover:bg-terracotta-dark text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
          >
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-terracotta-primary selection:text-white font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border px-4 sm:px-8 py-3.5 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Context */}
          <div className="flex items-center gap-4">
            <Link
              href={`/posts/${postId}`}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Cancel editing"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center gap-3">
              <BrandLogo size="sm" showSubtitle={false} href="/" />
              <div className="hidden sm:block border-l border-border pl-3">
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta-primary block">
                  Editing Story
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {user?.full_name || user?.username || 'Author'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4">
            <Link
              href={`/posts/${postId}`}
              className="hidden sm:block text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-terracotta-primary hover:bg-terracotta-dark disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Writing Canvas */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Story Title Input */}
        <div className="mb-6">
          <Textarea
            ref={titleTextareaRef}
            placeholder="Title"
            value={title}
            maxLength={100}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setTitle(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            rows={1}
            className="w-full text-4xl sm:text-5xl font-black placeholder:text-muted-foreground/40 bg-transparent text-foreground border-none outline-none focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none tracking-tight resize-none overflow-hidden font-serif min-h-0 p-0 shadow-none"
          />
        </div>

        {/* Collapsible Story Settings & Metadata Tile Component */}
        <CategoryTagsTile
          categories={categories}
          availableTags={availableTags}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(catId) => setSelectedCategoryId(catId)}
          selectedTags={selectedTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          detectedArticleImages={detectedArticleImages}
        />

        {/* Lexical Rich Text Editor with Initial Content */}
        {isLoaded && (
          <LexicalEditor
            onChange={setContentHtml}
            placeholder="Edit your story..."
            initialHtml={initialHtml}
          />
        )}
      </main>
    </div>
  );
}
