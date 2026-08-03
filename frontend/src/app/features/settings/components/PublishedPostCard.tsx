'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  MoreHorizontal,
  Bookmark,
  Pin,
  PinOff,
  Edit3,
  Settings,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
import type { Post } from '../../sports-blog-home/types';
import type { AuthUser } from '../../auth/types';
import { pinPost, unpinPost } from '../../sports-blog-home/actions/pin_posts';

interface PublishedPostCardProps {
  post: Post;
  user: AuthUser | null;
  onMoreClick?: (post: Post) => void;
  onDeleteClick?: (post: Post) => void;
  onEditClick?: (post: Post) => void;
  pinnedCount?: number;
  onPinChange?: () => void;
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Helper to strip HTML tags if Lexical HTML content is returned
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export function PublishedPostCard({
  post,
  user,
  onDeleteClick,
  onEditClick,
  pinnedCount,
  onPinChange,
}: PublishedPostCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(post.is_pinned ?? false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsPinned(post.is_pinned ?? false);
  }, [post.is_pinned]);

  const authorName = post.author || user?.full_name || user?.username || 'Author';
  const authorPhoto = user?.profile_photo_url;
  const formattedDate = formatDate(post.date_posted);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Total reaction counts or fallback
  const totalReactions =
    (post.reaction_counts?.love || 0) +
    (post.reaction_counts?.like || 0) +
    (post.reaction_counts?.laugh || 0) ||
    post.likes || 0;

  // Feed responses carry `excerpt` (already plain) instead of the full body.
  const plainContent = stripHtml(post.excerpt ?? post.content ?? '');

  const isPinDisabled = !isPinned && pinnedCount !== undefined && pinnedCount >= 3;

  const handleTogglePin = async () => {
    setIsMenuOpen(false);

    if (isPinDisabled) {
      toast.error('Cap reached', {
        description: 'At most 3 posts can be pinned. Unpin another story first.',
      });
      return;
    }

    const nextState = !isPinned;
    setIsPinned(nextState);

    try {
      if (nextState) {
        await pinPost(post.id);
        toast.success('Story Pinned', {
          description: `"${post.title.slice(0, 25)}..." pinned to profile.`,
        });
      } else {
        await unpinPost(post.id);
        toast.success('Story Unpinned', {
          description: `"${post.title.slice(0, 25)}..." unpinned.`,
        });
      }
      if (onPinChange) {
        onPinChange();
      }
    } catch (err: unknown) {
      setIsPinned(!nextState);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update pin status.';
      toast.error(nextState ? 'Pin Failed' : 'Unpin Failed', {
        description: errorMessage,
      });
    }
  };

  const handleToggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    toast.success(nextState ? 'Saved to Bookmarks' : 'Removed from Bookmarks', {
      description: `"${post.title.slice(0, 25)}..."`,
    });
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    if (onEditClick) {
      onEditClick(post);
    } else {
      router.push(`/posts/${post.id}/edit`);
    }
  };

  const handleSettings = () => {
    setIsMenuOpen(false);
    toast.info('Story Settings', { description: `Settings opened for "${post.title.slice(0, 25)}..."` });
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (onDeleteClick) {
      onDeleteClick(post);
    } else {
      toast.error('Delete Story', { description: `Removing "${post.title.slice(0, 25)}..."` });
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-terracotta-primary/40 transition-all duration-200 shadow-sm space-y-4 relative">
      {/* 1. Header: user_photo | User_name | published_date | Pinned indicator | category */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0 border border-border">
            <AvatarImage src={authorPhoto || undefined} alt={authorName} />
            <AvatarFallback className="text-[10px] bg-terracotta-primary text-white font-bold">
              {authorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-foreground tracking-wide">{authorName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground font-medium">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pinned Badge Indicator */}
          {isPinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Pin size={11} className="fill-amber-500 text-amber-500" />
              <span>Pinned</span>
            </span>
          )}

          {post.category && (
            <span className="text-[11px] font-semibold text-terracotta-primary bg-terracotta-primary/10 border border-terracotta-primary/20 px-2.5 py-0.5 rounded-full">
              {post.category.name}
            </span>
          )}
        </div>
      </div>

      {/* 2. Middle Content Grid: user post title + body 2 lines | user post cover image */}
      <Link href={`/posts/${post.id}`} className="block group">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground group-hover:text-terracotta-primary transition-colors leading-snug tracking-tight">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground font-normal leading-relaxed line-clamp-2">
              {plainContent || 'No preview content available.'}
            </p>
          </div>

          {post.image_url ? (
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt={post.title}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-border group-hover:border-terracotta-primary/50 transition-colors"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs shrink-0 select-none">
              No Cover
            </div>
          )}
        </div>
      </Link>

      {/* 3. Card Footer: reactions & bookmark | 3 dots floating menu */}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Reaction Count Badge */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-primary bg-terracotta-primary/10 border border-terracotta-primary/20 px-3 py-1 rounded-full">
            <Heart size={14} className="fill-terracotta-primary text-terracotta-primary" />
            <span>{totalReactions}</span>
          </div>

          {/* Bookmark Action Icon */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Story'}
          >
            <Bookmark size={15} className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
          </button>
        </div>

        {/* Floating Dropdown Menu Container */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Story options menu"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            title="Story options"
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Non-blocking Floating Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-30 min-w-[190px] bg-card border border-border rounded-2xl shadow-2xl py-1.5 animate-in fade-in-50 zoom-in-95">
              <button
                type="button"
                onClick={handleEdit}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <Edit3 size={15} className="text-terracotta-primary" />
                <span>Edit Story</span>
              </button>

              <button
                type="button"
                disabled={isPinDisabled}
                onClick={handleTogglePin}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-2.5 ${
                  isPinDisabled ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'text-foreground cursor-pointer'
                }`}
                title={isPinDisabled ? 'At most 3 posts can be pinned. Unpin another story first.' : undefined}
              >
                {isPinned ? (
                  <>
                    <PinOff size={15} className="text-amber-500" />
                    <span>Unpin Story</span>
                  </>
                ) : (
                  <>
                    <Pin size={15} className="text-amber-500" />
                    <span>Pin the story</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSettings}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <Settings size={15} className="text-muted-foreground" />
                <span>Story Settings</span>
              </button>

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={handleDelete}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <Trash2 size={15} className="text-red-500" />
                <span>Delete Story</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
