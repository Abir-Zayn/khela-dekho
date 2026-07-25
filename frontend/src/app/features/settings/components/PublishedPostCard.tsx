'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MoreHorizontal, MessageSquare, ThumbsUp, Laugh } from 'lucide-react';
import type { Post } from '../../sports-blog-home/types';
import type { AuthUser } from '../../auth/types';

interface PublishedPostCardProps {
  post: Post;
  user: AuthUser | null;
  onMoreClick?: (post: Post) => void;
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

export function PublishedPostCard({ post, user, onMoreClick }: PublishedPostCardProps) {
  const authorName = post.author || user?.full_name || user?.username || 'Author';
  const authorPhoto = user?.profile_photo_url;
  const formattedDate = formatDate(post.date_posted);

  // Total reaction counts or fallback
  const totalReactions =
    (post.reaction_counts?.love || 0) +
    (post.reaction_counts?.like || 0) +
    (post.reaction_counts?.laugh || 0) ||
    post.likes || 0;

  const plainContent = stripHtml(post.content || '');

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-5 hover:border-zinc-700/80 transition-all duration-200 shadow-lg space-y-4">
      {/* 1. Header: user_photo | User_name | 'published_date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {authorPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorPhoto}
              alt={authorName}
              className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-red-600 border border-red-500 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
              {authorName.charAt(0)}
            </span>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white tracking-wide">{authorName}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 font-medium">{formattedDate}</span>
          </div>
        </div>

        {post.category && (
          <span className="text-[11px] font-semibold text-red-400 bg-red-950/40 border border-red-900/60 px-2.5 py-0.5 rounded-full">
            {post.category.name}
          </span>
        )}
      </div>

      {/* 2. Middle Content Grid: user post title + body 2 lines | user post cover image */}
      <Link href={`/posts/${post.id}`} className="block group">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-red-400 transition-colors leading-snug tracking-tight">
              {post.title}
            </h2>
            <p className="text-sm text-zinc-300 font-normal leading-relaxed line-clamp-2">
              {plainContent || 'No preview content available.'}
            </p>
          </div>

          {post.image_url ? (
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt={post.title}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center text-zinc-700 text-xs shrink-0 select-none">
              No Cover
            </div>
          )}
        </div>
      </Link>

      {/* 3. Card Footer: [loved] reaction numbers | [horizontal_line_button (...)] */}
      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-950/30 border border-red-900/40 px-3 py-1 rounded-full">
          <Heart size={14} className="fill-red-500 text-red-500" />
          <span>{totalReactions}</span>
        </div>

        <button
          type="button"
          onClick={() => onMoreClick?.(post)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          title="More options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
